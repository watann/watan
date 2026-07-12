import crypto from 'node:crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE = 'watan_admin_session';
const SESSION_SECONDS = 60 * 60 * 24 * 7;

function getAdminEmail() {
  return (process.env.ADMIN_EMAIL || 'w.awakalaey@gmail.com').trim().toLowerCase();
}

function getSecret() {
  const explicit = process.env.ADMIN_SESSION_SECRET;
  if (explicit) return explicit;

  const password = process.env.ADMIN_PASSWORD || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return crypto.createHash('sha256').update(`${password}:${serviceKey}`).digest('hex');
}

function sign(value) {
  return crypto.createHmac('sha256', getSecret()).update(value).digest('base64url');
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export function adminAuthConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.ADMIN_PASSWORD,
  );
}

export function validateCredentials(email, password) {
  const expectedEmail = getAdminEmail();
  const expectedPassword = process.env.ADMIN_PASSWORD || '';
  return safeEqual(String(email).trim().toLowerCase(), expectedEmail) &&
    safeEqual(String(password), expectedPassword);
}

export function createSessionToken() {
  const payload = Buffer.from(JSON.stringify({
    email: getAdminEmail(),
    exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS,
  })).toString('base64url');

  return `${payload}.${sign(payload)}`;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_SECONDS,
  };
}

export async function readAdminSession() {
  if (!adminAuthConfigured()) return null;
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return null;

  const [payload, signature] = token.split('.');
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!parsed?.email || !parsed?.exp) return null;
    if (parsed.exp < Math.floor(Date.now() / 1000)) return null;
    if (!safeEqual(String(parsed.email).toLowerCase(), getAdminEmail())) return null;
    return { id: 'portfolio-admin', email: getAdminEmail() };
  } catch {
    return null;
  }
}
