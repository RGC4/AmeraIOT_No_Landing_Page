import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

// Receives Contact Us form submissions:
//   1. Saves the message to the contact_submissions table (required — if this
//      fails the visitor sees an error, nothing is silently dropped).
//   2. Emails a copy to the site owner via Resend (best-effort — a mail
//      failure is logged but does not fail the submission, because the
//      message is already safely stored and visible at /admin/messages).
//
// Configuration:
//   DATABASE_URL       — required (Postgres; same value in Replit and Vercel)
//   RESEND_API_KEY     — optional; enables the email copy
//   CONTACT_EMAIL_TO   — optional; defaults to info@ameramail.com
//   CONTACT_EMAIL_FROM — optional; defaults to Resend's onboarding sender
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 32 * 1024;
const LIMITS = { name: 200, email: 200, company: 200, phone: 50, message: 5000 } as const;
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

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

async function sendEmailCopy(sub: {
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[contact] RESEND_API_KEY not set — submission saved, no email sent');
    return;
  }
  const to = process.env.CONTACT_EMAIL_TO || 'info@ameramail.com';
  const from = process.env.CONTACT_EMAIL_FROM || 'Amera Website <onboarding@resend.dev>';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: sub.email,
      subject: `New contact form message from ${sub.name}`,
      html: `<h2>New message from the Amera website contact form</h2>
<p><strong>Name:</strong> ${escapeHtml(sub.name)}<br/>
<strong>Email:</strong> ${escapeHtml(sub.email)}<br/>
<strong>Company:</strong> ${escapeHtml(sub.company) || '—'}<br/>
<strong>Phone:</strong> ${escapeHtml(sub.phone) || '—'}</p>
<p style="white-space:pre-wrap">${escapeHtml(sub.message)}</p>
<p>All messages are also saved at ameraiot.com/admin/messages.</p>`,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('[contact] email copy failed:', res.status, text.slice(0, 300));
  }
}

export async function POST(request: NextRequest) {
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
    await getPool().query(
      `INSERT INTO contact_submissions (name, email, company, phone, message)
       VALUES ($1, $2, $3, $4, $5)`,
      [name, email, company, phone, message]
    );
  } catch (err) {
    console.error('[contact] failed to save submission:', err);
    return NextResponse.json(
      { ok: false, error: 'Your message could not be saved. Please email us directly.' },
      { status: 502 }
    );
  }

  try {
    await sendEmailCopy({ name, email, company, phone, message });
  } catch (err) {
    console.error('[contact] email copy failed:', err);
  }

  return NextResponse.json({ ok: true });
}
