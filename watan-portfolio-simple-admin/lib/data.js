import { createPublicClient } from '@/lib/supabase/public';
import { sampleProjects } from '@/lib/site-content';

export async function getPublicProjects() {
  const supabase = createPublicClient();
  if (!supabase) return sampleProjects;

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error || !data?.length) return sampleProjects;
  return data;
}
