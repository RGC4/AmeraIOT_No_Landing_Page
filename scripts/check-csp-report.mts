#!/usr/bin/env tsx
/**
 * Abuse-protection guard for the CSP violation-report endpoint
 * (src/app/api/csp-report/route.ts).
 *
 * That endpoint is intentionally unauthenticated — browsers POST violation
 * reports to it with no credentials — so it carries lightweight defenses that
 * must never silently regress:
 *   - a hard request-body size cap (enforced via Content-Length AND while
 *     streaming, so a client can't omit the declared length to slip past);
 *   - a per-IP rate limit (a cheap speed bump against a single abusive source);
 *   - graceful handling of malformed/empty bodies (acknowledge, don't crash);
 *   - acceptance of both genuine report shapes (legacy report-uri + Reporting
 *     API) so real browser reports always get through.
 *
 * Until now those were only verified by hand with curl. This script imports the
 * route's POST handler and calls it directly with hand-built NextRequests — no
 * dev server, no network, no port. That makes it deterministic: the rate-limit
 * counter lives in the handler's module memory, which only persists reliably
 * IN-PROCESS (a dev server can recompile/reset modules mid-run, which made an
 * HTTP-based version of this check flaky under concurrent validation load).
 *
 * Self-contained, no test framework (run via `tsx`, like check-structured-data
 * is run via node). Exit 0 = every protection behaves as expected; exit 1 = a
 * defense regressed.
 *
 * Each case uses a fresh, unique x-forwarded-for IP so the per-IP counter starts
 * clean — that keeps the functional cases from tripping the rate limit.
 */

import { NextRequest } from 'next/server';
import { POST } from '../src/app/api/csp-report/route.ts';

// Must match the constants in src/app/api/csp-report/route.ts. If those change,
// update these too — the suite asserts behaviour exactly at these thresholds.
const MAX_BODY_BYTES = 16 * 1024;
const RATE_LIMIT_MAX = 100;

const failures: string[] = [];
function fail(msg: string) {
  failures.push(msg);
}

/* ------------------------------- helpers --------------------------------- */

let ipCounter = 0;
/** A fresh, unique source IP so each case gets its own rate-limit bucket. */
function freshIp(): string {
  ipCounter += 1;
  return `198.51.${(ipCounter >> 8) & 0xff}.${ipCounter & 0xff}`;
}

type ReqInit = {
  body?: BodyInit | null;
  headers?: Record<string, string>;
  ip?: string;
  stream?: boolean;
};

/** Build a NextRequest for the endpoint, defaulting to a fresh client IP. */
function buildRequest(init: ReqInit = {}): NextRequest {
  const headers: Record<string, string> = {
    'x-forwarded-for': init.ip ?? freshIp(),
    ...init.headers,
  };
  const opts: RequestInit & { duplex?: string } = { method: 'POST', headers };
  if (init.body !== undefined) opts.body = init.body;
  if (init.stream) opts.duplex = 'half'; // required when body is a stream
  return new NextRequest('http://localhost/api/csp-report', opts);
}

async function status(init: ReqInit): Promise<number> {
  const res = await POST(buildRequest(init));
  return res.status;
}

async function expectStatus(name: string, gotPromise: Promise<number>, want: number) {
  let got: number;
  try {
    got = await gotPromise;
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    fail(`${name}: handler threw (${reason}).`);
    console.log(`  [FAIL] ${name} — handler threw: ${reason}`);
    return;
  }
  if (got === want) {
    console.log(`  [ok] ${name} → ${got}`);
  } else {
    fail(`${name}: expected HTTP ${want}, got ${got}.`);
    console.log(`  [FAIL] ${name} — expected ${want}, got ${got}`);
  }
}

/** A ReadableStream that emits `bytes` total in `chunk`-sized pieces. */
function byteStream(bytes: number, chunk = 8 * 1024): ReadableStream<Uint8Array> {
  let sent = 0;
  return new ReadableStream<Uint8Array>({
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

/* ---------------------------------- main --------------------------------- */

async function main() {
  // 1) Oversized body declared up front via Content-Length → fast 413.
  await expectStatus(
    'oversized body (Content-Length)',
    status({ headers: { 'content-type': 'application/json', 'content-length': String(MAX_BODY_BYTES + 4096) }, body: 'x' }),
    413,
  );

  // 2) Oversized body streamed with NO Content-Length → 413 from the streaming
  //    cap (the client can't dodge the limit by omitting the declared length).
  await expectStatus(
    'oversized body (streamed, no Content-Length)',
    status({ body: byteStream(MAX_BODY_BYTES + 8 * 1024), stream: true, headers: { 'content-type': 'application/json' } }),
    413,
  );

  // 3) Malformed JSON → 204 (acknowledge so the browser doesn't retry forever).
  await expectStatus(
    'malformed JSON',
    status({ body: '{ this is : not json', headers: { 'content-type': 'application/json' } }),
    204,
  );

  // 4) Empty body → 204.
  await expectStatus('empty body', status({ headers: { 'content-type': 'application/json' } }), 204);

  // 5) Empty JSON object → 204 (parses fine, just no violations to log).
  await expectStatus('empty JSON object', status({ body: '{}', headers: { 'content-type': 'application/json' } }), 204);

  // 6) Genuine legacy report-uri payload → 204.
  await expectStatus(
    'legacy report-uri payload',
    status({
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
    status({
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

  if (failures.length > 0) {
    console.error(`\nCSP-report guard FAILED (${failures.length} issue(s)):`);
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.log('\nCSP-report guard passed: body cap, rate limit, and payload handling all hold.');
}

async function checkRateLimit() {
  const ip = freshIp();
  let firstLimited = 0;
  let badBefore = 0;
  for (let i = 1; i <= RATE_LIMIT_MAX + 5; i++) {
    const s = await status({ body: '{}', ip, headers: { 'content-type': 'application/json' } });
    if (s === 429) {
      firstLimited = i;
      break;
    }
    if (s !== 204) badBefore += 1;
  }

  if (badBefore > 0) {
    fail(`rate limit: ${badBefore} request(s) before the limit returned a non-204 status.`);
  }
  if (firstLimited === 0) {
    fail(`rate limit: never returned 429 within ${RATE_LIMIT_MAX + 5} requests from one IP.`);
    console.log('  [FAIL] per-IP rate limit — no 429 observed');
  } else if (firstLimited === RATE_LIMIT_MAX + 1) {
    console.log(`  [ok] per-IP rate limit → 429 on request #${firstLimited} (after ${RATE_LIMIT_MAX} accepted)`);
  } else {
    fail(`rate limit: first 429 was request #${firstLimited}, expected #${RATE_LIMIT_MAX + 1} (threshold ${RATE_LIMIT_MAX}).`);
    console.log(`  [FAIL] per-IP rate limit — first 429 at #${firstLimited}, expected #${RATE_LIMIT_MAX + 1}`);
  }
}

main().catch((err) => {
  console.error('CSP-report guard errored:', err);
  process.exit(1);
});
