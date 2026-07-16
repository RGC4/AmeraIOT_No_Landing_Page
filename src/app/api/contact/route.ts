import { NextRequest, NextResponse } from 'next/server';

// Receives Contact Us form submissions and forwards them to the Google Sheet
// via a Google Apps Script "web app" attached to the sheet (see
// scripts/contact-sheet-apps-script.gs for the script and setup steps).
//
// Configuration (required in every environment that should accept messages):
//   CONTACT_SHEET_WEBHOOK_URL — the Apps Script web-app URL (ends in /exec)
//   CONTACT_FORM_TOKEN        — shared secret; the same value is pasted into
//                               the Apps Script so it only accepts our posts.
// If either is missing the endpoint fails loudly with a 503 (no silent drop).
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 32 * 1024;

// Field length caps — generous for real messages, hostile to abuse.
const LIMITS = { name: 200, email: 200, company: 200, phone: 50, message: 5000 } as const;

// Basic shape check only — the definitive validation is a human reading the sheet.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Per-IP rate limit: at most 5 submissions per 10 minutes. In-memory and
// per-instance (same accepted tradeoff as the csp-report endpoint).
const RATE_LIMIT_WINDOW_MS = 10 * 60_000;
const RATE_LIMIT_MAX = 5;
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
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

function clean(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

export async function POST(request: NextRequest) {
  const webhookUrl = process.env.CONTACT_SHEET_WEBHOOK_URL;
  const token = process.env.CONTACT_FORM_TOKEN;
  if (!webhookUrl || !token) {
    console.error('[contact] CONTACT_SHEET_WEBHOOK_URL / CONTACT_FORM_TOKEN not configured');
    return NextResponse.json(
      { ok: false, error: 'The contact form is not configured yet. Please email us directly.' },
      { status: 503 }
    );
  }

  if (isRateLimited(getClientIp(request))) {
    return NextResponse.json(
      { ok: false, error: 'Too many messages from this connection. Please try again later.' },
      { status: 429 }
    );
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: 'Message too large.' }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  // Honeypot: real visitors never see or fill this field. Pretend success so
  // bots learn nothing.
  if (clean(body.website, 200) !== '') {
    return NextResponse.json({ ok: true });
  }

  const name = clean(body.name, LIMITS.name);
  const email = clean(body.email, LIMITS.email);
  const company = clean(body.company, LIMITS.company);
  const phone = clean(body.phone, LIMITS.phone);
  const message = clean(body.message, LIMITS.message);

  if (!name || !message || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: 'Please fill in your name, a valid email, and a message.' },
      { status: 400 }
    );
  }

  try {
    // Apps Script web apps answer POSTs with a redirect to a one-time
    // googleusercontent URL, so redirects must be followed.
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, name, email, company, phone, message }),
      redirect: 'follow',
      signal: AbortSignal.timeout(15_000),
    });
    const text = await res.text();
    if (!res.ok || !text.includes('"ok":true')) {
      console.error('[contact] sheet webhook rejected submission:', res.status, text.slice(0, 300));
      return NextResponse.json(
        { ok: false, error: 'Your message could not be saved. Please email us directly.' },
        { status: 502 }
      );
    }
  } catch (err) {
    console.error('[contact] sheet webhook unreachable:', err);
    return NextResponse.json(
      { ok: false, error: 'Your message could not be saved. Please email us directly.' },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
