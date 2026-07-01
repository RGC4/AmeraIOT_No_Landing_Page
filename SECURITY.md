# Security Policy

## Supported Versions

This is the source for the Amera Technologies marketing website. Only the
currently deployed `main` branch is supported and receives security updates.

| Version            | Supported          |
| ------------------ | ------------------ |
| `main` (deployed)  | :white_check_mark: |
| Older commits/tags | :x:                |

## Reporting a Vulnerability

Please report security vulnerabilities **privately** — do not open a public
GitHub issue for security problems.

- **Preferred:** Use GitHub's [private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)
  (the "Report a vulnerability" button under the repository's **Security** tab).
- **Email:** info@ameramail.com

When reporting, please include:

- A description of the issue and its potential impact.
- Steps to reproduce (proof-of-concept, affected URL/route, request details).
- Any relevant logs, screenshots, or suggested remediation.

### Response targets

- **Acknowledgement:** within 3 business days.
- **Triage & severity assessment:** within 7 business days.
- **Fix or mitigation plan:** communicated after triage, prioritized by severity.

Please give us a reasonable window to remediate before any public disclosure.
We will keep you informed of progress and credit reporters who wish to be
acknowledged.

## Security Posture

This site is a static/SSR display-only marketing site. It has no user
authentication, no user accounts, and does not persist user-submitted data.

Production responses are served with a full set of HTTP security headers,
injected via `src/middleware.ts`:

- `Content-Security-Policy` — `default-src 'self'` baseline with a tight
  per-directive allowlist (`object-src 'none'`, `base-uri 'self'`,
  `form-action 'self'`, `frame-ancestors 'self'`, `upgrade-insecure-requests`).
  Embedded video is allowlisted to the Bunny Stream player
  (`iframe.mediadelivery.net`, `*.b-cdn.net`).
- `Strict-Transport-Security` — `max-age=63072000; includeSubDomains; preload`.
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — disables camera, microphone, geolocation (and
  browsing-topics).
- `X-XSS-Protection: 1; mode=block`

### CSP violation reporting

The production CSP reports any blocked resource so we get early warning if the
policy ever breaks a legitimate script, style, image, or video before visitors
notice. This is wired up in `src/middleware.ts`:

- The production policy carries both a `report-to csp-endpoint` directive (modern
  Reporting API) and a legacy `report-uri /api/csp-report` directive, so both
  current and older browsers deliver reports.
- The `csp-endpoint` group is declared via the `Reporting-Endpoints` response
  header (plus the legacy `Report-To` JSON header), both pointing at the
  same-origin route `/api/csp-report`.
- That route handler (`src/app/api/csp-report/route.ts`) accepts both the legacy
  `application/csp-report` body shape and the modern `application/reports+json`
  array, normalizes them, and logs each violation as a single structured
  `[csp-violation] …` line. On Vercel these land in the function logs, where they
  can be searched on.

#### Forwarding to an alert channel (`CSP_REPORT_WEBHOOK_URL`)

Function logs are easy to miss, so a real blocked resource could go unnoticed for
days. To make reports **actionable**, set the environment variable
`CSP_REPORT_WEBHOOK_URL` to a webhook for the destination of your choice:

- **What it accepts:** any Slack or Discord *incoming webhook* URL (the handler
  posts both `text` and `content`, the fields those services read), or any
  generic collector — the request body also includes a structured `violations`
  array.
- **Where to set it:** in **Vercel → Project → Settings → Environment
  Variables** (Production). Treat the URL as a **secret** — anyone holding a
  Slack/Discord webhook URL can post to that channel — so do **not** commit it.
  When unset, nothing breaks: violations are still written to the function logs
  exactly as before.
- **No flooding:** identical violations (same directive + blocked URI +
  document) are forwarded to the channel at most once per 10 minutes, so one
  broken resource can't spam it. The raw logs are never de-duplicated.
- **Resilient:** the forward is bounded by a 3-second timeout and never throws —
  a slow or down webhook can't break the report endpoint or the site.

#### Per-IP rate limit (best-effort by default; shared store optional)

The endpoint is unauthenticated, so it carries a per-IP rate limit
(`RATE_LIMIT_MAX` requests per `RATE_LIMIT_WINDOW_MS`). A genuine browser sends
tiny, infrequent reports and never approaches it.

- **Default (no config): deliberate best-effort speed bump.** The counter lives
  in the function's memory. On Vercel each serverless instance has its own
  memory and cold starts spin up fresh ones, so this limit is **per-instance,
  not a global quota** — a determined abuser spread across instances can exceed
  the cap. This is an **accepted trade-off** for a low-value endpoint whose worst
  case is extra log lines (already capped per request and bounded in memory); we
  don't add infrastructure for a threat we haven't observed.
- **Optional: enforce it globally across instances.** Point the endpoint at a
  shared store and the limit holds cluster-wide. Set **either** the Upstash
  Redis REST pair (`UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`) **or**
  the Vercel KV pair (`KV_REST_API_URL` + `KV_REST_API_TOKEN`, which is Upstash
  under the hood) in **Vercel → Project → Settings → Environment Variables**.
  The handler talks to the store over plain HTTPS `fetch` (a single
  `INCR` + `PEXPIRE …NX` pipeline) — **no SDK, no npm dependency**, so nothing
  ships until the vars are present. Treat the tokens as **secrets**.
- **Fail-open:** if the shared store is slow or unreachable (1 s timeout), the
  handler silently falls back to the in-memory limit rather than block. A KV
  outage can never swallow a genuine browser report — real reports still get a
  204.

Reporting via the CSP directives is **production-only** — the `report-to` /
`report-uri` directives and their headers are gated behind
`NODE_ENV === 'production'`, so local dev (with its relaxed dev CSP) does not
emit reports. (The forwarding step itself only depends on
`CSP_REPORT_WEBHOOK_URL` being set, so it can be exercised in any environment by
posting a report to `/api/csp-report` directly.)

To verify reporting works, set `CSP_REPORT_WEBHOOK_URL` and trigger an
intentional violation on a production build — e.g. load a page with a
`<script src="https://example.com/x.js">` that the policy blocks — then confirm
both a `[csp-violation]` line in the logs **and** a message in the configured
channel.

### Known accepted items

- **CSP `script-src` is nonce-based (no `'unsafe-inline'`).** Production serves
  `script-src 'self' 'nonce-<per-request>' 'strict-dynamic'`; every inline
  script Next.js emits and our JSON-LD blocks carry the per-request nonce
  generated in `src/middleware.ts`.
- **CSP `style-src` deliberately retains `'unsafe-inline'`.** This is an
  accepted, intentional decision — not an oversight — and a nonce/hash cannot
  replace it. Under CSP Level 3, `'unsafe-inline'` is ignored as soon as a nonce
  or hash appears in a directive, and nonces only authorize `<style>` *elements*,
  never inline `style="..."` *attributes*. `next/image` (used on ~18 pages) and a
  few dynamic React `style` props emit inline style attributes (e.g.
  `color:transparent`, `object-fit`, a computed `transition-duration`) whose
  values vary at runtime and cannot be exhaustively hashed. Adding a nonce/hash
  would break image and carousel rendering for zero security gain. Residual risk
  is low: the JS-execution vector is fully locked down (`script-src` nonce +
  `strict-dynamic`, `object-src 'none'`), inline styles cannot execute script,
  and the site renders no untrusted user input (the news feed is fetched
  server-side from trusted RSS sources and sanitized before render). Inline
  `style` attributes in our own code are minimal (`src/components/ui/AppImage.tsx`,
  `src/app/industries/page.tsx`).
- **Remaining `npm audit` moderate advisories** are transitive within
  `next` / `postcss` / `yaml` and only resolvable via semver-major upgrades,
  which require separate QA and are tracked outside this hardening pass.
