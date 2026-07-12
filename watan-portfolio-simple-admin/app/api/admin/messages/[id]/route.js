import { requireAdminApi } from '@/lib/auth';

export async function PATCH(request, { params }) {
  const { supabase, response } = await requireAdminApi();
  if (response) return response;
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { data, error } = await supabase.from('contact_messages').update({ is_read: Boolean(body.is_read) }).eq('id', id).select('*').single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ message: data });
}

export async function DELETE(_request, { params }) {
  const { supabase, response } = await requireAdminApi();
  if (response) return response;
  const { id } = await params;
  const { error } = await supabase.from('contact_messages').delete().eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ ok: true });
}
