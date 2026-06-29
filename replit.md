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
4. Attach the custom domain **`amera.io`** under **Project → Settings →
   Domains**, and update DNS at the registrar (GoDaddy) per Vercel's
   instructions.

DNS cutover and decommissioning the old Cloudflare setup are separate, owner-led
steps and are out of scope for the codebase.

## Security headers

All HTTP security headers and the strict production Content-Security-Policy live
in `src/middleware.ts` (Next.js middleware, which runs natively on Vercel). This
is the **single source of truth** for headers — `next.config.mjs` only sets
dev-only no-cache headers. See `SECURITY.md` for the full policy and the
documented CSP decisions (nonce-based `script-src`; `style-src` keeps
`'unsafe-inline'` by design).

## Media

Images and video are served from the **Bunny.net CDN**. Video uses **Bunny
Stream** (the `iframe.mediadelivery.net` player) — not YouTube. Large raw media
is kept out of the repo (`attached_assets/` is gitignored) and hosted on the
CDN.

## User preferences

- Keep a **single typeface (Inter)** everywhere — body, headings, hero tagline.
  Don't reintroduce a second font without an explicit request.
- **Full-width text:** headers, body copy, and hero paragraphs should span the
  page. Avoid narrow `max-w-*` constraints on plain paragraphs (callout boxes
  and centered CTAs may stay constrained).
- Explanations should assume a **non-technical** reader: lead with what changes
  for the user, keep jargon out.
