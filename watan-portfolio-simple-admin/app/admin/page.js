import DashboardClient from '@/components/admin/DashboardClient';
import { requireAdminPage } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const { supabase, user } = await requireAdminPage();

  const [{ data: messages = [] }, { data: projects = [] }] = await Promise.all([
    supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
    supabase.from('projects').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false }),
  ]);

  return <DashboardClient initialMessages={messages} initialProjects={projects} userEmail={user.email} />;
}
