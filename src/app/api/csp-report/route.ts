import { NextRequest, NextResponse } from 'next/server';

// Receives Content-Security-Policy violation reports from browsers and logs
// them server-side so we get early warning if the production policy ever blocks
// a legitimate script, style, image, or video before visitors notice.
//
// Browsers send reports in two shapes depending on the directive used:
//   - Legacy `report-uri`: a single POST with content-type
//     `application/csp-report`, body `{ "csp-report": { ... } }`.
//   - Modern Reporting API (`report-to`): a POST with content-type
//     `application/reports+json`, body is an array of report objects whose
//     `type` is `"csp-violation"` and whose payload lives under `body`.
// We accept both and normalize to a flat list before logging.
//
// This endpoint is intentionally unauthenticated (browsers post here with no
// credentials), so it carries lightweight abuse protection that never trips on
// genuine reports:
//   - A hard cap on the request body size, enforced while streaming so an
//     attacker cannot make us buffer an unbounded payload.
//   - A best-effort per-IP rate limit (in-memory; see note below).
//   - A cap on how many individual reports we process/log per request.
// Genuine browser CSP reports are tiny and infrequent, so they comfortably stay
// under every limit and still get a 204.
export const dynamic = 'force-dynamic';

// Real CSP reports are a few hundred bytes to a couple KB. 16 KB is generous
// headroom while still rejecting obviously bogus oversized payloads.
const MAX_BODY_BYTES = 16 * 1024;

// At most this many violations are logged per request, so a single crafted
// array of reports can't flood the logs.
const MAX_REPORTS_PER_REQUEST = 50;

// Best-effort per-IP rate limit. NOTE: serverless instances (Vercel) are
// ephemeral and not shared, so this counter is per-instance, not global — it is
// a cheap, dependency-free speed bump against a single abusive source, not a
// hard quota. A genuine browser never approaches this rate.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 100;
const hits = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || now >= entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    // Opportunistic cleanup so the map can't grow without bound.
    if (hits.size > 5000) {
      for (const [key, value] of hits) {
        if (now >= value.resetAt) hits.delete(key);
      }
    }
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

// --- Forwarding to an external alert channel --------------------------------
// When CSP_REPORT_WEBHOOK_URL is set, each (de-duplicated) violation is POSTed
// there so a blocked resource raises a *visible* alert instead of sitting
// unread among everything else in the Vercel function logs. The payload is
// compatible with Slack and Discord incoming webhooks (it sends both `text` and
// `content`) and also carries a structured `violations` array for any generic
// collector (e.g. a logging service or a Sentry/Datadog-style intake).
//
// When the variable is unset, behaviour is unchanged: violations are still
// written to the platform logs via console.warn below — nothing is lost.
//
// Treat the URL as a secret: a Slack/Discord webhook URL grants posting access,
// so set it in the Vercel project's environment variables (or Replit secrets),
// never in the repo. See SECURITY.md → "CSP violation reporting".
const REPORT_WEBHOOK_URL = process.env.CSP_REPORT_WEBHOOK_URL;

// Abort a slow or unreachable webhook so the report endpoint always responds
// promptly. A forwarding failure is logged, never thrown.
const FORWARD_TIMEOUT_MS = 3_000;

// De-duplicate identical violations *for the alert channel only*, so a single
// broken resource (which a browser may report on every page view) can't flood
// it. The same violation — same disposition + directive + blocked URI +
// document — is forwarded at most once per window. The platform logs are NOT
// de-duplicated; every violation is still console.warn'd in full.
const DEDUPE_WINDOW_MS = 10 * 60_000;
// Hard ceiling on the dedupe map. The endpoint is unauthenticated, so a flood of
// forged reports with unique signatures could otherwise grow it without bound
// (expired-only cleanup wouldn't help while entries are still within the
// window). Past this size we evict the oldest entries — worst case a genuine
// suppressed alert forwards again sooner, which is harmless.
const FORWARD_DEDUPE_MAX = 5000;
const forwarded = new Map<string, number>(); // signature -> expiresAt (ms)

function shouldForward(signature: string): boolean {
  const now = Date.now();
  const expiresAt = forwarded.get(signature);
  if (expiresAt && now < expiresAt) return false;

  forwarded.set(signature, now + DEDUPE_WINDOW_MS);
  if (forwarded.size > FORWARD_DEDUPE_MAX) {
    // First drop anything already expired...
    for (const [key, exp] of forwarded) {
      if (now >= exp) forwarded.delete(key);
    }
    // ...then, if still over the cap, evict oldest (Map preserves insertion
    // order) until back under it, guaranteeing a bounded footprint.
    while (forwarded.size > FORWARD_DEDUPE_MAX) {
      const oldest = forwarded.keys().next().value;
      if (oldest === undefined) break;
      forwarded.delete(oldest);
    }
  }
  return true;
}

// Neutralize chat-control characters in user-controlled report fields before
// they are sent to a webhook. The endpoint is unauthenticated, so forged
// reports could otherwise smuggle channel pings (@channel/@everyone), Slack/
// Discord link syntax (<!channel>, <@id>), code-span breakouts, or extra lines
// into the alert. Reports are URLs/directive names, so this stays readable.
function neutralizeForChat(value: string): string {
  return value
    .replace(/[\r\n]+/g, ' ') // keep each report on its own bullet line
    .replace(/@/g, '@\u200b') // zero-width space defuses @channel/@everyone/@user
    .replace(/</g, '\uFF1C') // fullwidth < defuses <!channel> / <@id>
    .replace(/>/g, '\uFF1E')
    .replace(/`/g, "'"); // can't break out of a code span
}

async function forwardViolations(summaries: string[]): Promise<void> {
  if (!REPORT_WEBHOOK_URL || summaries.length === 0) return;

  const heading =
    summaries.length === 1
      ? 'CSP violation reported'
      : `${summaries.length} CSP violations reported`;
  const safe = summaries.map(neutralizeForChat);
  const text = `${heading}\n${safe.map((s) => `- ${s}`).join('\n')}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FORWARD_TIMEOUT_MS);
  try {
    const res = await fetch(REPORT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      // `text` → Slack / Google Chat, `content` → Discord, `violations` → the
      // structured form for a generic collector. Harmless extra fields are
      // ignored by services that don't use them. `allowed_mentions` is Discord's
      // belt-and-braces switch to suppress ALL pings (Slack/others ignore it);
      // the text itself is already neutralized via neutralizeForChat.
      body: JSON.stringify({
        text,
        content: text,
        violations: safe,
        allowed_mentions: { parse: [] },
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.warn(`[csp-violation] forward failed: webhook responded ${res.status}`);
    }
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.warn(`[csp-violation] forward failed: ${reason}`);
  } finally {
    clearTimeout(timer);
  }
}

// Read the request body as text, aborting early if it exceeds `maxBytes`.
// Streaming (rather than request.text()/request.json()) means we never buffer
// more than the cap, even if the client lies about or omits Content-Length.
async function readBodyCapped(
  request: NextRequest,
  maxBytes: number
): Promise<{ text: string; tooLarge: boolean }> {
  const body = request.body;
  if (!body) return { text: '', tooLarge: false };

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        return { text: '', tooLarge: true };
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { text: new TextDecoder().decode(merged), tooLarge: false };
}

type CspViolationFields = {
  'document-uri'?: string;
  documentURL?: string;
  'violated-directive'?: string;
  effectiveDirective?: string;
  'effective-directive'?: string;
  'blocked-uri'?: string;
  blockedURL?: string;
  disposition?: string;
  'original-policy'?: string;
};

function normalize(payload: unknown): CspViolationFields[] {
  if (!payload || typeof payload !== 'object') return [];

  // Legacy report-uri: { "csp-report": { ... } }
  if ('csp-report' in payload) {
    const report = (payload as Record<string, unknown>)['csp-report'];
    return report ? [report as CspViolationFields] : [];
  }

  // Reporting API (report-to): array of { type, body, ... }
  if (Array.isArray(payload)) {
    return payload
      .filter(
        (r) => r && typeof r === 'object' && (r as Record<string, unknown>).type === 'csp-violation'
      )
      .map((r) => (r as Record<string, unknown>).body as CspViolationFields)
      .filter(Boolean);
  }

  return [];
}

export async function POST(request: NextRequest) {
  // 1) Cheap per-IP rate-limit check before doing any work.
  if (isRateLimited(getClientIp(request))) {
    return new NextResponse(null, {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)) },
    });
  }

  // 2) Fast reject when the client declares an oversized body up front.
  const declaredLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return new NextResponse(null, { status: 413 });
  }

  // 3) Read the body with a hard cap, even if Content-Length is missing/lying.
  const { text, tooLarge } = await readBodyCapped(request, MAX_BODY_BYTES);
  if (tooLarge) {
    return new NextResponse(null, { status: 413 });
  }

  let payload: unknown = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    // Malformed body — acknowledge so the browser doesn't retry forever.
    return new NextResponse(null, { status: 204 });
  }

  const violations = normalize(payload).slice(0, MAX_REPORTS_PER_REQUEST);
  const toForward: string[] = [];
  for (const v of violations) {
    const documentUri = v['document-uri'] ?? v.documentURL ?? 'unknown';
    const directive =
      v['effective-directive'] ?? v.effectiveDirective ?? v['violated-directive'] ?? 'unknown';
    const blockedUri = v['blocked-uri'] ?? v.blockedURL ?? 'unknown';
    const disposition = v.disposition ?? 'enforce';

    // Structured single-line summary so it is easy to grep/alert on in
    // production logs (Vercel). Kept concise; the full original policy is omitted.
    const summary = `disposition=${disposition} directive="${directive}" blocked="${blockedUri}" document="${documentUri}"`;
    console.warn(`[csp-violation] ${summary}`);

    // Queue for the external alert channel, de-duplicated so one broken
    // resource doesn't flood it. (Logging above is never de-duplicated.)
    const signature = `${disposition}|${directive}|${blockedUri}|${documentUri}`;
    if (shouldForward(signature)) toForward.push(summary);
  }

  // Forward (de-duplicated) violations to the configured alert channel. Awaited
  // so it actually runs on serverless before the response returns; it is
  // bounded by a timeout and never throws. No-ops when no webhook is configured.
  await forwardViolations(toForward);

  // 204: report accepted, nothing to return.
  return new NextResponse(null, { status: 204 });
}
