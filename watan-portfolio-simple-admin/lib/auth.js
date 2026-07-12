import { redirect } from 'next/navigation';
import { adminAuthConfigured, readAdminSession } from '@/lib/admin-session';
import { createAdminClient } from '@/lib/supabase/admin';

export async function getAdminContext() {
  const configured = adminAuthConfigured();
  if (!configured) {
    return { supabase: null, user: null, isAdmin: false, configured: false };
  }

  const user = await readAdminSession();
  const supabase = createAdminClient();
  return { supabase, user, isAdmin: Boolean(user), configured: true };
}

export async function requireAdminPage() {
  const context = await getAdminContext();
  if (!context.configured) redirect('/admin/login?error=setup');
  if (!context.user) redirect('/admin/login');
  return context;
}

export async function requireAdminApi() {
  const context = await getAdminContext();
  if (!context.configured) {
    return { ...context, response: Response.json({ error: 'Admin is not configured.' }, { status: 503 }) };
  }
  if (!context.user) {
    return { ...context, response: Response.json({ error: 'Unauthenticated' }, { status: 401 }) };
  }
  return { ...context, response: null };
}
