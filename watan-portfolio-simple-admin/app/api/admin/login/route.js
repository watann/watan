import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE,
  adminAuthConfigured,
  createSessionToken,
  sessionCookieOptions,
  validateCredentials,
} from '@/lib/admin-session';

export const runtime = 'nodejs';

export async function POST(request) {
  if (!adminAuthConfigured()) {
    return NextResponse.json({ error: 'Admin is not configured.' }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  if (!validateCredentials(body.email, body.password)) {
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, createSessionToken(), sessionCookieOptions());
  return response;
}
