#!/usr/bin/env node
/**
 * Legacy-URL redirect guard.
 *
 * After the site was restructured, several old URLs that Google still links to
 * were kept alive with permanent redirects (next.config.mjs `redirects()`).
 * These are easy to break silently: a restructure, a typo in the redirect list,
 * or a removed entry could quietly turn any of them back into a 404 —
 * re-breaking the exact links visitors click from Google, with nothing failing
 * visibly.
 *
 * To guarantee the guard can never fall behind, it does NOT keep its own copy of
 * the redirect list. It imports next.config.mjs, calls `redirects()`, and derives
 * the checks from that output. Adding a redirect to next.config.mjs therefore
 * makes this guard verify it automatically — there is no second list to update.
 *
 * This guard requests each derived old URL and asserts it returns a *permanent*
 * redirect (301/308) whose Location points at the correct new page.
 *
 * This check fails (exit 1) when:
 *   - a legacy URL stops redirecting, redirects with a non-permanent status, or
 *     redirects to the wrong destination.
 *
 * Note on /downloads: the retired Downloads section is one of the entries in
 * `redirects()` (it redirects to the Products page), so it is covered
 * automatically like any other legacy URL.
 *
 * It manages its own server the same way scripts/check-structured-data.mjs does:
 * by default it reuses a server already serving at BASE_URL
 * (default http://localhost:5000) or starts `next dev`. Redirects apply in ALL
 * environments (they are not production-gated), so dev mode is sufficient to
 * verify them. The server is shut down when finished.
 */

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname + '/..';

const DEFAULT_PORT = '5000';
const BASE_URL = (process.env.BASE_URL || `http://localhost:${DEFAULT_PORT}`).replace(/\/$/, '');

/**
 * Build a sample value for a Next.js path parameter so a pattern like
 * "/downloads/:path*" can be requested as a concrete URL. The same value is
 * substituted into the destination too, so a redirect that forwards a param
 * (e.g. "/old/:slug" -> "/new/:slug") is compared correctly.
 */
function sampleFor(name) {
  return `sample-${name}`;
}

/**
 * Turn one next.config redirect ({ source, destination, permanent }) into a
 * concrete check by substituting any Next.js path params (`:name`, `:name*`,
 * `:name+`, `:name?`) in both source and destination with the same sample value.
 */
function toCheck(redirect) {
  const params = new Map();
  const substitute = (pattern) =>
    pattern.replace(/:(\w+)([*+?]?)/g, (_, name) => {
      if (!params.has(name)) params.set(name, sampleFor(name));
      return params.get(name);
    });
  return {
    original: redirect.source,
    source: substitute(redirect.source),
    destination: substitute(redirect.destination),
  };
}

/**
 * Load the moved-page redirects straight from next.config.mjs. `redirects()`
 * returns both the same-origin legacy redirects AND (in production) the
 * /assets/* -> Bunny CDN redirect. We only want the same-origin moved pages, so
 * keep entries whose destination is a relative path ("/..."); that naturally
 * excludes the absolute CDN URL. This is the single source of truth — there is
 * no duplicated list to maintain here.
 */
async function loadExpected() {
  const configUrl = new URL('../next.config.mjs', import.meta.url);
  const nextConfig = (await import(configUrl)).default;
  if (typeof nextConfig?.redirects !== 'function') {
    throw new Error('next.config.mjs does not export a redirects() function.');
  }
  const all = await nextConfig.redirects();
  return all
    .filter((r) => typeof r.destination === 'string' && r.destination.startsWith('/'))
    .map(toCheck);
}

const PERMANENT_REDIRECT_STATUSES = new Set([301, 308]);

const failures = [];
function fail(msg) {
  failures.push(msg);
}

/**
 * Normalize a Location header to a same-origin pathname for comparison. Next.js
 * emits a relative path (e.g. "/products/amerakey"); tolerate an absolute URL on
 * the same origin too, and strip any trailing slash so "/x" and "/x/" compare
 * equal.
 */
function locationPath(location) {
  if (!location) return null;
  let path = location;
  try {
    // Absolute URL -> take its pathname; relative -> URL() resolves against base.
    path = new URL(location, BASE_URL).pathname;
  } catch {
    return null;
  }
  return path.length > 1 ? path.replace(/\/$/, '') : path;
}

async function fetchStatus(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 30000);
  try {
    const res = await fetch(url, { redirect: 'manual', signal: ctrl.signal });
    return { status: res.status, location: res.headers.get('location') };
  } finally {
    clearTimeout(t);
  }
}

/* ------------------------------ server control ---------------------------- */

async function reachable(url) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}

async function startServer() {
  const port = new URL(BASE_URL).port || DEFAULT_PORT;

  // Grace period: the main "Start application" workflow may still be booting.
  // Waiting here avoids stealing its port and leaving it stuck in EADDRINUSE.
  console.log(`No server reachable at ${BASE_URL}; waiting up to 90s for the app workflow...`);
  const grace = Date.now() + 90000;
  while (Date.now() < grace) {
    if (await reachable(BASE_URL)) {
      console.log(`Server appeared at ${BASE_URL}; reusing it.`);
      return null;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log(`Still no server at ${BASE_URL}; starting "next dev -p ${port}"...`);
  const proc = spawn('npx', ['next', 'dev', '-p', port], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
  });
  proc.stdout.on('data', () => {});
  proc.stderr.on('data', () => {});

  const deadline = Date.now() + 120000;
  while (Date.now() < deadline) {
    if (await reachable(BASE_URL)) return proc;
    await new Promise((r) => setTimeout(r, 1500));
  }
  proc.kill('SIGKILL');
  throw new Error('Timed out waiting for the dev server to start.');
}

/* ---------------------------------- main ---------------------------------- */

async function main() {
  const expected = await loadExpected();
  if (expected.length === 0) {
    console.error(
      'Legacy-redirect guard FAILED: next.config.mjs redirects() returned no ' +
        'same-origin moved-page redirects to verify. Expected at least one.',
    );
    process.exit(1);
  }

  let spawned = null;
  if (!(await reachable(BASE_URL))) {
    spawned = await startServer();
  } else {
    console.log(`Using server already running at ${BASE_URL}.`);
  }

  try {
    for (const entry of expected) {
      const url = BASE_URL + entry.source;
      let res;
      try {
        res = await fetchStatus(url);
      } catch (err) {
        fail(`${entry.original}: request failed (${err.message}).`);
        continue;
      }

      if (!PERMANENT_REDIRECT_STATUSES.has(res.status)) {
        fail(
          `${entry.original}: expected a permanent redirect (301/308), got ${res.status}. ` +
            `The redirect may have been removed from next.config.mjs redirects().`,
        );
        continue;
      }
      const got = locationPath(res.location);
      const want = entry.destination.replace(/\/$/, '') || '/';
      if (got !== want) {
        fail(
          `${entry.original}: redirects to "${res.location ?? '(no Location)'}" ` +
            `(path "${got ?? 'none'}"), expected "${want}". ` +
            `Check the destination in next.config.mjs redirects().`,
        );
        continue;
      }
      console.log(`  [ok] ${entry.original} -> ${res.status} ${want}`);
    }
  } finally {
    if (spawned) {
      spawned.kill('SIGKILL');
    }
  }

  if (failures.length > 0) {
    console.error(`\nLegacy-redirect guard FAILED with ${failures.length} problem(s):`);
    for (const f of failures) console.error(`  - ${f}`);
    console.error(
      `\nThese old URLs are linked from Google. Restore the redirect in next.config.mjs ` +
        `so visitors don't hit 404s.`,
    );
    process.exit(1);
  }

  console.log(`\nLegacy-redirect guard passed: all ${expected.length} legacy URL(s) behave correctly.`);
}

main().catch((err) => {
  console.error(`Legacy-redirect guard crashed: ${err.stack || err.message}`);
  process.exit(1);
});
