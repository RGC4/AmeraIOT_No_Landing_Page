import { NextRequest, NextResponse } from 'next/server';

const PERMISSIONS_POLICY = 'camera=(), microphone=(), geolocation=(), browsing-topics=()';

// CSP violation reports are posted here (same-origin Next.js route handler).
// Wired into the production CSP via both the modern Reporting API
// (`report-to` + the `Reporting-Endpoints` header) and the legacy `report-uri`
// directive, so both older and newer browsers deliver violations.
const CSP_REPORT_PATH = '/api/csp-report';
const CSP_REPORT_GROUP = 'csp-endpoint';

const IMG_HOSTS = [
  'https://images.unsplash.com',
  'https://images.pexels.com',
  'https://images.pixabay.com',
  'https://img.rocket.new',
  'https://*.b-cdn.net', // Bunny CDN (default pull-zone hostname)
  'https://cdn.ameraiot.com', // branded Bunny CDN hostname (alias of the pull zone)
].join(' ');

// Bunny Stream: iframe player origin + media/HLS CDN (b-cdn.net pull zones).
// All video is served via the Bunny Stream player (src/components/VideoModal.tsx);
// the legacy YouTube origin has been removed now that nothing embeds it.
const VIDEO_FRAME_HOSTS = 'https://iframe.mediadelivery.net';
const VIDEO_MEDIA_HOSTS =
  'https://*.b-cdn.net https://cdn.ameraiot.com https://iframe.mediadelivery.net';

// Display-only marketing site. In production script-src allows the app's own
// scripts: 'self' for external chunk files plus 'unsafe-inline' for the inline
// bootstrap/streaming scripts Next.js emits. We intentionally do NOT use a
// per-request nonce: a unique nonce per request forces Next.js to render every
// page dynamically (Cache-Control: no-store), which disabled the browser
// back/forward cache and made mobile Safari intermittently show a blank page.
// A static CSP lets pages be prerendered and CDN-cached. Residual XSS risk is
// low: this site renders no untrusted user input, object-src is 'none', and
// base-uri/form-action are locked to 'self'. See SECURITY.md.
//
// style-src deliberately keeps 'unsafe-inline' and must NOT be given a nonce or
// hash. Under CSP Level 3, 'unsafe-inline' is ignored the moment a nonce/hash
// appears in a directive, and a nonce only authorizes <style> *elements* — never
// inline `style="..."` *attributes*. next/image (used on ~18 pages) and a few
// dynamic React style props emit such attributes (color:transparent, object-fit,
// computed transition-duration) whose values vary at runtime and cannot be
// enumerated or hashed. Adding a nonce/hash here would break image and carousel
// rendering for no security gain. Residual risk is low: script-src is limited to
// 'self' + 'unsafe-inline', object-src is 'none', base-uri/form-action are
// 'self', and the site renders no untrusted user input. See SECURITY.md
// "Known accepted items".
function buildCsp(): string {
  const isDev = process.env.NODE_ENV !== 'production';
  // Next.js dev (HMR / React Fast Refresh) additionally needs 'unsafe-eval' and
  // a websocket channel; production keeps 'self' + 'unsafe-inline' (see the
  // block comment above for why a nonce is intentionally not used).
  const scriptSrc = isDev
    ? `script-src 'self' 'unsafe-inline' 'unsafe-eval'`
    : `script-src 'self' 'unsafe-inline'`;
  const connectSrc = isDev
    ? `connect-src 'self' ws: wss: ${VIDEO_MEDIA_HOSTS}`
    : `connect-src 'self' ${VIDEO_MEDIA_HOSTS}`;

  const directives = [
    `default-src 'self'`,
    `base-uri 'self'`,
    `font-src 'self' data:`,
    `form-action 'self'`,
    `frame-ancestors 'self'`,
    `frame-src 'self' ${VIDEO_FRAME_HOSTS}`,
    `img-src 'self' data: blob: ${IMG_HOSTS}`,
    `manifest-src 'self'`,
    `media-src 'self' ${VIDEO_MEDIA_HOSTS}`,
    `object-src 'none'`,
    scriptSrc,
    // Intentional: do NOT add a nonce/hash here (see buildCsp comment above) —
    // it would disable 'unsafe-inline' and break next/image's inline styles.
    `style-src 'self' 'unsafe-inline'`,
    connectSrc,
  ];
  if (!isDev) {
    directives.push(`upgrade-insecure-requests`);
    // Report blocked resources so we get early warning in production. Both the
    // modern `report-to` (group declared via the Reporting-Endpoints header
    // below) and the legacy `report-uri` are emitted for broad browser support.
    directives.push(`report-to ${CSP_REPORT_GROUP}`);
    directives.push(`report-uri ${CSP_REPORT_PATH}`);
  }
  return directives.join('; ');
}

export function middleware(request: NextRequest) {
  // Note: the retired /downloads section is handled by a permanent redirect to
  // the Products page in next.config.mjs redirects() (not a 410 here), so anyone
  // tapping the stale Google sitelink lands on a real page instead of an error.

  // The CSP is identical for every request (no per-request nonce), so pages
  // stay statically prerenderable and CDN-cacheable. A per-request nonce used
  // to force dynamic rendering (Cache-Control: no-store), which broke Safari's
  // back/forward cache and caused intermittent blank pages on mobile.
  const csp = buildCsp();

  const response = NextResponse.next();

  response.headers.set('Content-Security-Policy', csp);
  // Reporting destinations for the CSP `report-to`/`report-uri` directives. Only
  // set in production (the directives themselves are dev-gated in buildCsp).
  // `Reporting-Endpoints` is the modern Reporting API header; `Report-To` is the
  // legacy JSON form still required by some browsers.
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Reporting-Endpoints', `${CSP_REPORT_GROUP}="${CSP_REPORT_PATH}"`);
    response.headers.set(
      'Report-To',
      JSON.stringify({
        group: CSP_REPORT_GROUP,
        max_age: 10886400,
        endpoints: [{ url: CSP_REPORT_PATH }],
      })
    );
  }
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', PERMISSIONS_POLICY);
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
