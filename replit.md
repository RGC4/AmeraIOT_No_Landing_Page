# Amera IoT — Marketing Website

Corporate marketing site for Amera IoT, Inc. (post-quantum cybersecurity).

## Tech stack

- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS, light theme, single typeface (Inter) sitewide
- **Dev server:** `npm run dev` on port 5000 (the "Start application" workflow)
- **Build:** `npm run build` (standard `next build` — no custom adapter step)

## Deployment — Replit → GitHub → Vercel

The site deploys on **Vercel**, which builds Next.js natively. The flow is:

1. Work happens here in Replit.
2. Code is pushed to the **GitHub** repository.
3. **Vercel** is connected to that GitHub repo and **builds and deploys
   automatically on every push** (production on the main branch, preview
   deploys for other branches).

There is **no build adapter**. Vercel auto-detects this as a Next.js project and
runs `next build`. Do **not** reintroduce Cloudflare Workers / OpenNext
(`@opennextjs/cloudflare`, `wrangler`, `open-next.config.ts`, `wrangler.jsonc`)
or Netlify — they were removed on purpose. A plain `next build` is all Vercel
needs.

### One-time dashboard steps (done by the site owner, not in code)

These are account/dashboard actions Vercel requires that cannot be done from the
repo:

1. In Vercel, **Import** the GitHub repository as a new project.
2. Confirm the **Framework Preset = Next.js** (Vercel auto-detects this).
   Build command `next build` and output are the defaults — leave them.
3. Add any required environment variables in **Project → Settings →
   Environment Variables** (e.g. the Bunny media API key if/when used at build
   time).
4. Attach the custom domain **`ameraiot.com`** under **Project → Settings →
   Domains**. The domain is registered at **GoDaddy**, but its **DNS is hosted
   on Amazon Route 53** — so the DNS records Vercel asks for must be added in
   **Route 53**, not at GoDaddy.

DNS cutover and decommissioning the old Cloudflare setup are separate, owner-led
steps and are out of scope for the codebase.

## Publishing changes — one command

Editing and previewing locally **never** push anything live. When you're ready
to ship, run a single command:

```
npm run publish
```

This does both halves of going live, in order:

1. **Images → Bunny CDN.** Uploads any new or changed files in
   `public/assets` to the Bunny storage zone. Unchanged files are skipped.
2. **Code → GitHub.** Pushes your changed code to the `main` branch, which makes
   **Vercel build and deploy automatically**.

Useful variants:

- `npm run publish -- --dry-run` — shows exactly what *would* be sent, changes
  nothing. Good for a sanity check before publishing.
- `npm run publish -- --skip-git` — only sync images to Bunny.
- `npm run publish -- --skip-media` — only push code to GitHub.
- `npm run publish -- --prune` — also remove files on GitHub and Bunny that you
  deleted locally, including any Bunny folders left empty afterwards (off by
  default for safety).
- `npm run publish -- --force` — only needed if publishing stops with a warning
  that "GitHub has changed since your last publish." That safety check means the
  repo was edited somewhere other than this workspace; `--force` publishes your
  local version anyway and overwrites those outside changes.

**Reused image filenames:** the CDN caches each image URL for up to 30 days. If
you replace a picture but keep the **same filename**, visitors may keep seeing
the old one. The publish command tries to clear that cache automatically; if it
can't (no purge key), it warns you and the fix is to give the new picture a new
filename (e.g. add `-v2`). Brand-new filenames always appear immediately.

Note: this is **not** Replit's "Publish" button (that deploys to Replit's own
hosting, which this site does not use). `npm run publish` is the only thing that
ships to the live `ameraiot.com` site via GitHub → Vercel.

## Security headers

All HTTP security headers and the strict production Content-Security-Policy live
in `src/middleware.ts` (Next.js middleware, which runs natively on Vercel). This
is the **single source of truth** for headers — `next.config.mjs` only sets
dev-only no-cache headers. See `SECURITY.md` for the full policy and the
documented CSP decisions. Note: `script-src` uses `'self' 'unsafe-inline'`
(**not** a per-request nonce) on purpose — a per-request nonce forced every page
to render dynamically (`no-store`), which broke mobile-Safari caching and caused
intermittent blank pages. `style-src` keeps `'unsafe-inline'` by design.

## Media

Images and video are served from the **Bunny.net CDN**. Video uses **Bunny
Stream** (the `iframe.mediadelivery.net` player) — not YouTube. Large raw media
is kept out of the repo (`attached_assets/` is gitignored) and hosted on the
CDN.

### Branded CDN hostname — `cdn.ameraiot.com`

By default, `/assets/*` requests redirect to the shared Bunny hostname
`ameraiot.b-cdn.net`. Some VPN/ad blockers (e.g. **Proton VPN's NetShield**)
block the shared `b-cdn.net` domain, which silences every image and video while
the page itself (served from `ameraiot.com`) still loads — the "blank page with
only the menu" symptom. A **branded** CDN hostname avoids that blocklist.

The CDN base is controlled by one environment variable, `ASSET_CDN_BASE`
(default `https://ameraiot.b-cdn.net`), read in both `next.config.mjs` (the
`/assets/*` redirect) and `scripts/publish.mjs` (cache purge). The CSP in
`src/middleware.ts` already allows `cdn.ameraiot.com`, so switching is just DNS +
Bunny + one env var — **no code change needed**.

To switch to `cdn.ameraiot.com` (owner steps, in this order):

1. **Bunny dashboard** → the pull zone that serves `ameraiot.b-cdn.net` →
   **Hostnames** → **Add Custom Hostname** → `cdn.ameraiot.com`, then enable the
   free **Bunny TLS** (Let's Encrypt) certificate for it.
2. **Route 53** (where `ameraiot.com` DNS is hosted) → add a record:
   - **Type:** `CNAME`
   - **Name:** `cdn` (i.e. `cdn.ameraiot.com`)
   - **Value:** `ameraiot.b-cdn.net`
   - **TTL:** 300
3. Verify it works: `https://cdn.ameraiot.com/assets/og-default-v3.jpg` should
   load an image over HTTPS.
4. Only **after** step 3 succeeds: in **Vercel → Project → Settings →
   Environment Variables** set `ASSET_CDN_BASE = https://cdn.ameraiot.com`
   (Production) and redeploy. From then on all `/assets/*` media serves from the
   branded host. (Set the same variable in this workspace before running
   `npm run publish` so its cache-purge targets the branded host too.)

Do **not** point `ASSET_CDN_BASE` at `cdn.ameraiot.com` before steps 1–3 are
live, or every image/video will 404.

The **social share preview** (the card shown when the site is texted/linked) is
the AMERA shield+logo splash at `public/assets/og-default-v3.jpg` (1200×630),
set as `DEFAULT_OG_IMAGE` in `src/lib/seo.ts`. Reused OG filenames are cached for
weeks by both the CDN and link scrapers, so replace it with a **new** filename
(e.g. `-v3`) rather than overwriting.

## User preferences

- Keep a **single typeface (Inter)** everywhere — body, headings, hero tagline.
  Don't reintroduce a second font without an explicit request.
- **Full-width text:** headers, body copy, and hero paragraphs should span the
  page. Avoid narrow `max-w-*` constraints on plain paragraphs (callout boxes
  and centered CTAs may stay constrained).
- Explanations should assume a **non-technical** reader: lead with what changes
  for the user, keep jargon out.
- **Nothing goes live automatically.** Don't push code to GitHub or upload media
  to Bunny on every change. Batch it: changes stay local for preview, and only
  the `npm run publish` command (see "Publishing changes") ships code + images
  live together.
