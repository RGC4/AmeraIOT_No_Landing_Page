import { createHmac, timingSafeEqual } from 'crypto';

// Session cookie for the private /admin/messages page.
//
// The cookie value is `<expiry>.<hmac>` where the HMAC is keyed with
// ADMIN_SESSION_SECRET. Only the server can mint a valid cookie, and it is
// only minted after the visitor supplies the correct ADMIN_PASSWORD.
export const ADMIN_COOKIE = 'amera_admin_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s) throw new Error('ADMIN_SESSION_SECRET is not configured');
  return s;
}

function sign(expiry: number): string {
  return createHmac('sha256', secret()).update(`amera-admin.${expiry}`).digest('hex');
}

export function mintSession(): { value: string; maxAgeSeconds: number } {
  const expiry = Date.now() + SESSION_TTL_MS;
  return { value: `${expiry}.${sign(expiry)}`, maxAgeSeconds: SESSION_TTL_MS / 1000 };
}

export function verifySession(cookieValue: string | undefined): boolean {
  if (!cookieValue || !process.env.ADMIN_SESSION_SECRET) return false;
  const dot = cookieValue.indexOf('.');
  if (dot <= 0) return false;
  const expiry = Number(cookieValue.slice(0, dot));
  if (!Number.isFinite(expiry) || expiry < Date.now()) return false;
  const given = Buffer.from(cookieValue.slice(dot + 1), 'utf8');
  const expected = Buffer.from(sign(expiry), 'utf8');
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export function checkPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !password) return false;
  const a = Buffer.from(password, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  // Length-equal check first so timingSafeEqual doesn't throw; the length of
  // the admin password is not a meaningful secret here.
  return a.length === b.length && timingSafeEqual(a, b);
}
