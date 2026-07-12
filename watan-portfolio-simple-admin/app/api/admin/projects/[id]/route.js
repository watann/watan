import { requireAdminApi } from '@/lib/auth';
import { extensionForMime, parseProjectForm } from '@/lib/project-form';

export const runtime = 'nodejs';

export async function PATCH(request, { params }) {
  const { supabase, user, response } = await requireAdminApi();
  if (response) return response;
  const { id } = await params;
  const { data: existing, error: existingError } = await supabase.from('projects').select('*').eq('id', id).single();
  if (existingError) return Response.json({ error: 'Project not found.' }, { status: 404 });

  const formData = await request.formData();
  const parsed = parseProjectForm(formData);
  if (parsed.error) return Response.json({ error: parsed.error }, { status: 422 });

  let newPath = null;
  let imagePath = existing.image_path;
  let imageUrl = existing.image_url;
  if (parsed.image) {
    newPath = `${user.id}/${crypto.randomUUID()}.${extensionForMime(parsed.image.type)}`;
    const { error: uploadError } = await supabase.storage.from('project-images').upload(newPath, parsed.image, { contentType: parsed.image.type, cacheControl: '3600', upsert: false });
    if (uploadError) return Response.json({ error: uploadError.message }, { status: 400 });
    imagePath = newPath;
    imageUrl = supabase.storage.from('project-images').getPublicUrl(newPath).data.publicUrl;
  }

  const { data, error } = await supabase.from('projects').update({ ...parsed.payload, image_path: imagePath, image_url: imageUrl }).eq('id', id).select('*').single();
  if (error) {
    if (newPath) await supabase.storage.from('project-images').remove([newPath]);
    return Response.json({ error: error.message }, { status: 400 });
  }
  if (newPath && existing.image_path) await supabase.storage.from('project-images').remove([existing.image_path]);
  return Response.json({ project: data });
}

export async function DELETE(_request, { params }) {
  const { supabase, response } = await requireAdminApi();
  if (response) return response;
  const { id } = await params;
  const { data: project } = await supabase.from('projects').select('image_path').eq('id', id).maybeSingle();
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  if (project?.image_path) await supabase.storage.from('project-images').remove([project.image_path]);
  return Response.json({ ok: true });
}
