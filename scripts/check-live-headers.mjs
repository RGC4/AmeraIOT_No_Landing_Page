#!/usr/bin/env node
/**
 * Verify a LIVE / deployed URL serves the exact security headers and strict
 * production Content-Security-Policy that src/middleware.ts emits. This is the
 * one check that can only be done after the site is on Vercel (and, eventually,
 * after the ameraiot.com DNS cutover) — the middleware logic is verified locally,
 * but whether Vercel actually runs that middleware on the real domain can only
 * be confirmed against the live URL.
 *
 * Usage:
 *   node scripts/check-live-headers.mjs https://ameraiot.com
 *   node scripts/check-live-headers.mjs https://<project>.vercel.app
 *   node scripts/check-live-headers.mjs http://localhost:3000   (local prod build)
 *
 * Exits 0 if every required header is present and correct; 1 otherwise. Each
 * problem is printed with a recommended fix so a discrepancy points at its
 * cause (src/middleware.ts vs. a Vercel/middleware-matcher gap).
 *
 * src/middleware.ts is the single source of truth for headers; the expectations
 * below must mirror it.
 */

const TARGET = process.argv[2] || process.env.LIVE_URL;

if (!TARGET) {
  console.error(
    'Usage: node scripts/check-live-headers.mjs <url>\n' +
      '  e.g. node scripts/check-live-headers.mjs https://ameraiot.com\n' +
      '       node scripts/check-live-headers.mjs https://<project>.vercel.app',
  );
  process.exit(2);
}

const failures = [];
const oks = [];
function fail(msg, fix) {
  failures.push(fix ? `${msg}\n      ↳ Fix: ${fix}` : msg);
}
function pass(msg) {
  oks.push(msg);
}

// Exact-match headers (header name -> expected value), mirroring src/middleware.ts.
const EXACT = {
  'x-frame-options': 'SAMEORIGIN',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  'strict-transport-security': 'max-age=63072000; includeSubDomains; preload',
  'x-xss-protection': '1; mode=block',
};

const MIDDLEWARE_FIX =
  'src/middleware.ts is the single source of truth for headers — confirm the ' +
  'value there and that the middleware matcher covers this route.';
const MATCHER_FIX =
  'No security headers at all usually means Vercel is not running the Next.js ' +
  'middleware on this path. Check the `config.matcher` in src/middleware.ts ' +
  '(it excludes _next/static, _next/image, favicon.ico, and any dotted path) ' +
  'and that the deployment is a native Next.js build (not a static export).';

async function main() {
  console.log(`Checking live security headers at: ${TARGET}\n`);

  let res;
  // Follow redirects manually so the full hop chain is visible (an apex domain
  // like ameraiot.com commonly redirects), and so we validate the FINAL served
  // response — the page a real visitor lands on — rather than an opaque hop.
  const MAX_HOPS = 5;
  let url = TARGET;
  let finalUrl = TARGET;
  const chain = [];
  for (let hop = 0; hop <= MAX_HOPS; hop++) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 15000);
    try {
      res = await fetch(url, { redirect: 'manual', signal: ctrl.signal });
    } catch (err) {
      console.error(`Could not reach ${url}: ${err.message}`);
      console.error(
        'If the domain is not cut over to Vercel yet, test the temporary ' +
          'https://<project>.vercel.app URL instead.',
      );
      process.exit(1);
    } finally {
      clearTimeout(t);
    }

    const location = res.headers.get('location');
    if (res.status >= 300 && res.status < 400 && location) {
      const next = new URL(location, url).toString();
      chain.push(`${res.status}  ${url}  ->  ${next}`);
      url = next;
      finalUrl = next;
      if (hop === MAX_HOPS) {
        console.error(`Too many redirects (> ${MAX_HOPS}) starting from ${TARGET}.`);
        process.exit(1);
      }
      continue;
    }
    finalUrl = url;
    break;
  }

  if (chain.length) {
    console.log('Redirect chain:');
    for (const c of chain) console.log(`  ${c}`);
    console.log('');
  }
  console.log(`HTTP ${res.status}  (final URL: ${finalUrl})\n`);

  // Headers are attached by middleware even on error responses, so we still
  // validate them — but a non-OK page is worth flagging on its own.
  if (res.status >= 400) {
    console.warn(
      `Warning: ${TARGET} returned HTTP ${res.status}. Security headers are ` +
        'still checked below, but the page itself is erroring — investigate ' +
        'separately.\n',
    );
  }

  const present = res.headers.has('content-security-policy') ||
    Object.keys(EXACT).some((h) => res.headers.has(h));
  if (!present) {
    fail('No security headers present on this response.', MATCHER_FIX);
  }

  // 1) Exact-match headers.
  for (const [name, expected] of Object.entries(EXACT)) {
    const got = res.headers.get(name);
    if (got === null) {
      fail(`Missing header: ${name}`, MIDDLEWARE_FIX);
    } else if (got.trim() !== expected) {
      fail(`Header ${name} = "${got}" (expected "${expected}").`, MIDDLEWARE_FIX);
    } else {
      pass(`${name}: ${got}`);
    }
  }

  // 2) Strict production Content-Security-Policy.
  const csp = res.headers.get('content-security-policy');
  if (!csp) {
    fail('Missing header: content-security-policy', MIDDLEWARE_FIX);
  } else {
    const scriptSrc = (csp.match(/\bscript-src\b[^;]*/i) || [''])[0];
    if (!/'nonce-[^']+'/.test(scriptSrc)) {
      fail(
        `CSP script-src has no nonce — not the strict production policy. Got: ${scriptSrc || '(missing script-src)'}`,
        'Production must serve `script-src \'self\' \'nonce-…\' \'strict-dynamic\'`. ' +
          'A missing nonce usually means NODE_ENV !== "production" on the server ' +
          '(buildCsp in src/middleware.ts gates the strict policy on it).',
      );
    } else {
      pass('CSP script-src is nonce-based');
    }
    if (!/'strict-dynamic'/.test(scriptSrc)) {
      fail(`CSP script-src missing 'strict-dynamic'. Got: ${scriptSrc}`, MIDDLEWARE_FIX);
    } else {
      pass("CSP script-src has 'strict-dynamic'");
    }
    if (/'unsafe-eval'/.test(scriptSrc)) {
      fail(
        `CSP script-src allows 'unsafe-eval' — this is the dev/relaxed policy. Got: ${scriptSrc}`,
        'The server is running in development mode. Vercel production builds set ' +
          'NODE_ENV=production, which drops unsafe-eval (see buildCsp in src/middleware.ts).',
      );
    } else {
      pass("CSP script-src has no 'unsafe-eval'");
    }
    if (!/\bupgrade-insecure-requests\b/.test(csp)) {
      fail(
        "CSP missing 'upgrade-insecure-requests'.",
        'This directive is only added in production (buildCsp in src/middleware.ts). ' +
          'Its absence means the response was not served in production mode.',
      );
    } else {
      pass("CSP has 'upgrade-insecure-requests'");
    }
    if (!/object-src 'none'/.test(csp)) {
      fail("CSP missing `object-src 'none'`.", MIDDLEWARE_FIX);
    } else {
      pass("CSP has object-src 'none'");
    }
  }

  // ----------------------------- report -----------------------------
  if (oks.length) {
    console.log('Passed:');
    for (const o of oks) console.log(`  [ok] ${o}`);
    console.log('');
  }
  if (failures.length) {
    console.error('Failed:');
    for (const f of failures) console.error(`  [FAIL] ${f}`);
    console.error(
      `\nLive header check FAILED for ${TARGET} (${failures.length} issue(s)).`,
    );
    process.exit(1);
  }

  console.log(
    `Live header check passed: ${TARGET} serves all required security headers ` +
      'and the strict production CSP.',
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
