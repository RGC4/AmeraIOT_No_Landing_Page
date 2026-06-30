#!/usr/bin/env node
/**
 * Abuse-protection guard for the CSP violation-report endpoint
 * (src/app/api/csp-report/route.ts).
 *
 * That endpoint is intentionally unauthenticated — browsers POST violation
 * reports to it with no credentials — so it carries lightweight defenses that
 * must never silently regress:
 *   - a hard request-body size cap (enforced via Content-Length AND while
 *     streaming, so a client can't omit/under-report the length to slip past);
 *   - a per-IP rate limit (a cheap speed bump against a single abusive source);
 *   - graceful handling of malformed/empty bodies (acknowledge, don't crash);
 *   - acceptance of both genuine report shapes (legacy report-uri + Reporting
 *     API) so real browser reports always get through.
 *
 * Until now those were only verified by hand with curl. This script exercises
 * each protection over HTTP against the real route running in Next, in the same
 * self-contained style as scripts/check-structured-data.mjs (no test framework).
 * It reuses a server already serving at BASE_URL (default http://localhost:5000)
 * or starts `next dev` itself, then shuts that server down when finished.
 *
 * Exit 0 = every protection behaves as expected; exit 1 = a defense regressed.
 *
 * Each case uses a fresh, random x-forwarded-for IP so the endpoint's per-IP
 * counter starts clean — that keeps the functional cases from tripping the rate
 * limit and makes the suite safe to re-run without waiting for the window.
 */

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = `${__dirname}/..`;

const BASE_URL = (process.env.BASE_URL || 'http://localhost:5000').replace(/\/$/, '');
const ENDPOINT = `${BASE_URL}/api/csp-report`;

// Must match the constants in src/app/api/csp-report/route.ts. If those change,
// update these too — the suite asserts behaviour exactly at these thresholds.
const MAX_BODY_BYTES = 16 * 1024;
const RATE_LIMIT_MAX = 100;

const failures = [];
function fail(msg) {
  failures.push(msg);
}

/* ------------------------------- helpers --------------------------------- */

const ri = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
/** A fresh, almost-certainly-unique source IP so each case gets its own bucket. */
const freshIp = () => `198.${ri(1, 254)}.${ri(1, 254)}.${ri(1, 254)}`;

/**
 * POST to the endpoint and return the HTTP status. `stream: true` sends the body
 * as a chunked ReadableStream (no Content-Length) to exercise the streaming cap.
 */
async function post({ body, headers = {}, ip = freshIp(), stream = false }) {
  const h = { 'x-forwarded-for': ip, ...headers };
  const opts = { method: 'POST', headers: h };
  if (stream) {
    opts.body = body;
    opts.duplex = 'half'; // required by Node fetch when body is a stream
  } else if (body !== undefined) {
    opts.body = body;
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(ENDPOINT, { ...opts, signal: ctrl.signal });
    await res.arrayBuffer().catch(() => {}); // drain so the socket frees up
    return res.status;
  } finally {
    clearTimeout(timer);
  }
}

/** A ReadableStream that emits `bytes` total in `chunk`-sized pieces. */
function byteStream(bytes, chunk = 8 * 1024) {
  let sent = 0;
  return new ReadableStream({
    pull(controller) {
      if (sent >= bytes) {
        controller.close();
        return;
      }
      const size = Math.min(chunk, bytes - sent);
      controller.enqueue(new Uint8Array(size));
      sent += size;
    },
  });
}

async function expectStatus(name, gotPromise, want) {
  let got;
  try {
    got = await gotPromise;
  } catch (err) {
    fail(`${name}: request errored (${err.message}).`);
    console.log(`  [FAIL] ${name} — request errored: ${err.message}`);
    return;
  }
  if (got === want) {
    console.log(`  [ok] ${name} → ${got}`);
  } else {
    fail(`${name}: expected HTTP ${want}, got ${got}.`);
    console.log(`  [FAIL] ${name} — expected ${want}, got ${got}`);
  }
}

/* --------------------------- server management --------------------------- */

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
  const port = new URL(BASE_URL).port || '5000';
  console.log(`No server reachable at ${BASE_URL}; starting "next dev -p ${port}"...`);
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

/* ---------------------------------- main --------------------------------- */

async function main() {
  let spawned = null;
  if (!(await reachable(BASE_URL))) {
    spawned = await startServer();
  } else {
    console.log(`Using server already running at ${BASE_URL}.`);
  }

  try {
    // 1) Oversized body declared up front via Content-Length → fast 413.
    await expectStatus(
      'oversized body (Content-Length)',
      post({ body: 'x'.repeat(MAX_BODY_BYTES + 4096), headers: { 'content-type': 'application/json' } }),
      413,
    );

    // 2) Oversized body streamed with NO Content-Length → 413 from the
    //    streaming cap (the client can't dodge the limit by omitting the length).
    await expectStatus(
      'oversized body (streamed, no Content-Length)',
      post({ body: byteStream(MAX_BODY_BYTES + 8 * 1024), stream: true, headers: { 'content-type': 'application/json' } }),
      413,
    );

    // 3) Malformed JSON → 204 (acknowledge so the browser doesn't retry forever).
    await expectStatus(
      'malformed JSON',
      post({ body: '{ this is : not json', headers: { 'content-type': 'application/json' } }),
      204,
    );

    // 4) Empty body → 204.
    await expectStatus('empty body', post({ headers: { 'content-type': 'application/json' } }), 204);

    // 5) Empty JSON object → 204 (parses fine, just no violations to log).
    await expectStatus(
      'empty JSON object',
      post({ body: '{}', headers: { 'content-type': 'application/json' } }),
      204,
    );

    // 6) Genuine legacy report-uri payload → 204.
    await expectStatus(
      'legacy report-uri payload',
      post({
        headers: { 'content-type': 'application/csp-report' },
        body: JSON.stringify({
          'csp-report': {
            'document-uri': 'https://ameraiot.com/',
            'violated-directive': 'script-src',
            'blocked-uri': 'https://evil.example/x.js',
            disposition: 'enforce',
          },
        }),
      }),
      204,
    );

    // 7) Genuine Reporting API payload → 204.
    await expectStatus(
      'Reporting API payload',
      post({
        headers: { 'content-type': 'application/reports+json' },
        body: JSON.stringify([
          {
            type: 'csp-violation',
            body: {
              documentURL: 'https://ameraiot.com/',
              effectiveDirective: 'script-src',
              blockedURL: 'https://evil.example/x.js',
              disposition: 'enforce',
            },
          },
        ]),
      }),
      204,
    );

    // 8) Per-IP rate limit: from one fresh IP, the first RATE_LIMIT_MAX requests
    //    are accepted (204) and the very next one is throttled (429).
    await checkRateLimit();
  } finally {
    if (spawned) spawned.kill('SIGKILL');
  }

  if (failures.length > 0) {
    console.error(`\nCSP-report guard FAILED (${failures.length} issue(s)):`);
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.log('\nCSP-report guard passed: body cap, rate limit, and payload handling all hold.');
}

async function checkRateLimit() {
  const ip = freshIp();
  const body = '{}';
  let firstLimited = 0;
  let badBefore = 0;
  // Send a little past the threshold so we can pinpoint the first 429.
  for (let i = 1; i <= RATE_LIMIT_MAX + 5; i++) {
    const status = await post({ body, ip, headers: { 'content-type': 'application/json' } });
    if (status === 429) {
      firstLimited = i;
      break;
    }
    if (status !== 204) badBefore += 1;
  }

  if (badBefore > 0) {
    fail(`rate limit: ${badBefore} request(s) before the limit returned a non-204 status.`);
  }
  if (firstLimited === 0) {
    fail(`rate limit: never returned 429 within ${RATE_LIMIT_MAX + 5} requests from one IP.`);
    console.log(`  [FAIL] per-IP rate limit — no 429 observed`);
  } else if (firstLimited === RATE_LIMIT_MAX + 1) {
    console.log(`  [ok] per-IP rate limit → 429 on request #${firstLimited} (after ${RATE_LIMIT_MAX} accepted)`);
  } else {
    fail(
      `rate limit: first 429 was request #${firstLimited}, expected #${RATE_LIMIT_MAX + 1} ` +
        `(threshold ${RATE_LIMIT_MAX}).`,
    );
    console.log(`  [FAIL] per-IP rate limit — first 429 at #${firstLimited}, expected #${RATE_LIMIT_MAX + 1}`);
  }
}

main().catch((err) => {
  console.error('CSP-report guard errored:', err);
  process.exit(1);
});
