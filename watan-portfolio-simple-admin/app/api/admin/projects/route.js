import { requireAdminApi } from '@/lib/auth';
import { extensionForMime, parseProjectForm } from '@/lib/project-form';

export const runtime = 'nodejs';

export async function POST(request) {
  const { supabase, user, response } = await requireAdminApi();
  if (response) return response;
  const formData = await request.formData();
  const parsed = parseProjectForm(formData);
  if (parsed.error) return Response.json({ error: parsed.error }, { status: 422 });

  let imagePath = null;
  let imageUrl = null;
  if (parsed.image) {
    imagePath = `${user.id}/${crypto.randomUUID()}.${extensionForMime(parsed.image.type)}`;
    const { error: uploadError } = await supabase.storage.from('project-images').upload(imagePath, parsed.image, { contentType: parsed.image.type, cacheControl: '3600', upsert: false });
    if (uploadError) return Response.json({ error: uploadError.message }, { status: 400 });
    imageUrl = supabase.storage.from('project-images').getPublicUrl(imagePath).data.publicUrl;
  }

  const { data, error } = await supabase.from('projects').insert({ ...parsed.payload, image_path: imagePath, image_url: imageUrl }).select('*').single();
  if (error) {
    if (imagePath) await supabase.storage.from('project-images').remove([imagePath]);
    return Response.json({ error: error.message }, { status: 400 });
  }
  return Response.json({ project: data }, { status: 201 });
}
