import { NextRequest, NextResponse } from 'next/server';

const PERMISSIONS_POLICY =
  'camera=(), microphone=(), geolocation=(), browsing-topics=()';

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
  'https://*.b-cdn.net', // Bunny Stream video thumbnails / CDN
].join(' ');

// Bunny Stream: iframe player origin + media/HLS CDN (b-cdn.net pull zones).
// All video is served via the Bunny Stream player (src/components/VideoModal.tsx);
// the legacy YouTube origin has been removed now that nothing embeds it.
const VIDEO_FRAME_HOSTS = 'https://iframe.mediadelivery.net';
const VIDEO_MEDIA_HOSTS = 'https://*.b-cdn.net https://iframe.mediadelivery.net';

// Display-only marketing site. In production we run a strict, nonce-based
// script-src: every inline <script> Next.js emits (framework bootstrap, chunk
// loaders) plus our own JSON-LD blocks carry the per-request nonce, and
// 'strict-dynamic' extends that trust to the scripts they load. This lets us
// drop 'unsafe-inline' for scripts entirely. Next.js reads the nonce from the
// CSP it finds on the *request* headers (set below) and applies it to its own
// scripts automatically; our server components read it from the 'x-nonce'
// header.
//
// style-src deliberately keeps 'unsafe-inline' and must NOT be given a nonce or
// hash. Under CSP Level 3, 'unsafe-inline' is ignored the moment a nonce/hash
// appears in a directive, and a nonce only authorizes <style> *elements* — never
// inline `style="..."` *attributes*. next/image (used on ~18 pages) and a few
// dynamic React style props emit such attributes (color:transparent, object-fit,
// computed transition-duration) whose values vary at runtime and cannot be
// enumerated or hashed. Adding a nonce/hash here would break image and carousel
// rendering for no security gain. Residual risk is low: the JS-execution vector
// is locked to 'self' + nonce + 'strict-dynamic', object-src is 'none', and the
// site renders no untrusted user input. See SECURITY.md "Known accepted items".
function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV !== 'production';
  // Next.js dev (HMR / React Fast Refresh) needs eval + inline scripts + a
  // websocket channel. These relaxations apply ONLY in development; production
  // uses the strict nonce-based policy.
  const scriptSrc = isDev
    ? `script-src 'self' 'unsafe-inline' 'unsafe-eval'`
    : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`;
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
  // Per-request nonce. Generated for every request; only referenced by the CSP
  // in production, but always exposed via 'x-nonce' so server components can
  // attach it consistently across environments.
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = buildCsp(nonce);

  // Forward the nonce, the resolved CSP, and the pathname on the request so
  // Next.js can nonce its own scripts and our server components can read them.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  response.headers.set('Content-Security-Policy', csp);
  // Reporting destinations for the CSP `report-to`/`report-uri` directives. Only
  // set in production (the directives themselves are dev-gated in buildCsp).
  // `Reporting-Endpoints` is the modern Reporting API header; `Report-To` is the
  // legacy JSON form still required by some browsers.
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Reporting-Endpoints',
      `${CSP_REPORT_GROUP}="${CSP_REPORT_PATH}"`,
    );
    response.headers.set(
      'Report-To',
      JSON.stringify({
        group: CSP_REPORT_GROUP,
        max_age: 10886400,
        endpoints: [{ url: CSP_REPORT_PATH }],
      }),
    );
  }
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', PERMISSIONS_POLICY);
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload',
  );
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
