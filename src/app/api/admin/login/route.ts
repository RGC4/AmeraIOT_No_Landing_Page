import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, checkPassword, mintSession } from '@/lib/adminAuth';

// Login/logout for the private /admin/messages page. On a correct password we
// set a signed, HttpOnly session cookie valid for 7 days.
export const dynamic = 'force-dynamic';

// Per-IP throttle on password attempts: 10 tries per 15 minutes.
const WINDOW_MS = 15 * 60_000;
const MAX_ATTEMPTS = 10;
const attempts = new Map<string, { count: number; resetAt: number }>();

function ip(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

export async function POST(request: NextRequest) {
  const key = ip(request);
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now >= entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count += 1;
    if (entry.count > MAX_ATTEMPTS) {
      return NextResponse.json(
        { ok: false, error: 'Too many attempts. Please wait 15 minutes.' },
        { status: 429 }
      );
    }
  }

  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json(
      { ok: false, error: 'Admin access is not configured yet.' },
      { status: 503 }
    );
  }

  let password = '';
  try {
    const body = await request.json();
    if (typeof body.password === 'string') password = body.password;
  } catch {
    /* fall through to failed check */
  }

  if (!checkPassword(password)) {
    return NextResponse.json({ ok: false, error: 'Incorrect password.' }, { status: 401 });
  }

  const session = mintSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, session.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: session.maxAgeSeconds,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
