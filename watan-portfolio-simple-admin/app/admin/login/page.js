import { redirect } from 'next/navigation';
import LoginForm from '@/components/admin/LoginForm';
import { getAdminContext } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage({ searchParams }) {
  const context = await getAdminContext();
  if (context.user && context.isAdmin) redirect('/admin');
  const params = await searchParams;
  return (
    <LoginForm
      configured={context.configured}
      unauthorized={params?.error === 'unauthorized'}
      setupError={params?.error === 'setup'}
    />
  );
}
