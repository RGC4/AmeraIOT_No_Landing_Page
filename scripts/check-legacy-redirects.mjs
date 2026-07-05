#!/usr/bin/env node
/**
 * Legacy-URL redirect guard.
 *
 * After the site was restructured, several old URLs that Google still links to
 * were kept alive with redirects (next.config.mjs `redirects()`), and the retired
 * Downloads section was made to return a hard 410 "Gone" (src/middleware.ts).
 * These are easy to break silently: a restructure, a typo in the redirect list,
 * or an edit to the middleware could quietly turn any of them back into a 404 —
 * re-breaking the exact links visitors click from Google, with nothing failing
 * visibly.
 *
 * This guard requests each of those old URLs and asserts the expected result:
 *   - moved pages must return a *permanent* redirect (301/308) whose Location
 *     points at the correct new page;
 *   - /downloads (and anything beneath it) must return 410 Gone.
 *
 * This check fails (exit 1) when:
 *   - a legacy URL stops redirecting, redirects with a non-permanent status, or
 *     redirects to the wrong destination;
 *   - /downloads (or a path beneath it) stops returning 410.
 *
 * It manages its own server the same way scripts/check-structured-data.mjs does:
 * by default it reuses a server already serving at BASE_URL
 * (default http://localhost:5000) or starts `next dev`. Redirects and the 410
 * apply in ALL environments (they are not production-gated), so dev mode is
 * sufficient to verify them. The server is shut down when finished.
 */

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname + '/..';

const DEFAULT_PORT = '5000';
const BASE_URL = (process.env.BASE_URL || `http://localhost:${DEFAULT_PORT}`).replace(/\/$/, '');

/**
 * Every old URL Google still links to, and what it must do now. Keep this list
 * in lockstep with the `legacyRedirects` array in next.config.mjs and the
 * /downloads 410 in src/middleware.ts — if a redirect is added or changed there,
 * add/update it here so the guard keeps covering it.
 *
 *   - redirect : must return a permanent redirect (301/308) to `destination`.
 *   - gone     : must return 410 Gone.
 */
const EXPECTED = [
  { source: '/products', kind: 'redirect', destination: '/products/amerakey' },
  { source: '/vision-and-mission', kind: 'redirect', destination: '/company/vision-and-mission' },
  { source: '/industry-use-cases', kind: 'redirect', destination: '/industries' },
  { source: '/patents', kind: 'redirect', destination: '/company/patents' },
  { source: '/patent-portfolio', kind: 'redirect', destination: '/company/patents' },
  { source: '/our-patent-portfolio', kind: 'redirect', destination: '/company/patents' },
  { source: '/downloads', kind: 'gone' },
  // A path beneath /downloads must also be Gone (middleware matches the subtree).
  { source: '/downloads/whitepaper', kind: 'gone' },
];

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
  let spawned = null;
  if (!(await reachable(BASE_URL))) {
    spawned = await startServer();
  } else {
    console.log(`Using server already running at ${BASE_URL}.`);
  }

  try {
    for (const entry of EXPECTED) {
      const url = BASE_URL + entry.source;
      let res;
      try {
        res = await fetchStatus(url);
      } catch (err) {
        fail(`${entry.source}: request failed (${err.message}).`);
        continue;
      }

      if (entry.kind === 'gone') {
        if (res.status !== 410) {
          fail(
            `${entry.source}: expected HTTP 410 Gone, got ${res.status}. ` +
              `The /downloads 410 in src/middleware.ts may have been removed or changed.`,
          );
          continue;
        }
        console.log(`  [ok] ${entry.source} -> 410 Gone`);
        continue;
      }

      // kind === 'redirect'
      if (!PERMANENT_REDIRECT_STATUSES.has(res.status)) {
        fail(
          `${entry.source}: expected a permanent redirect (301/308), got ${res.status}. ` +
            `The redirect may have been removed from next.config.mjs redirects().`,
        );
        continue;
      }
      const got = locationPath(res.location);
      const want = entry.destination.replace(/\/$/, '') || '/';
      if (got !== want) {
        fail(
          `${entry.source}: redirects to "${res.location ?? '(no Location)'}" ` +
            `(path "${got ?? 'none'}"), expected "${want}". ` +
            `Check the destination in next.config.mjs redirects().`,
        );
        continue;
      }
      console.log(`  [ok] ${entry.source} -> ${res.status} ${want}`);
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
        `(or the /downloads 410 in src/middleware.ts) so visitors don't hit 404s.`,
    );
    process.exit(1);
  }

  console.log(`\nLegacy-redirect guard passed: all ${EXPECTED.length} legacy URL(s) behave correctly.`);
}

main().catch((err) => {
  console.error(`Legacy-redirect guard crashed: ${err.stack || err.message}`);
  process.exit(1);
});
