import { createPublicClient } from '@/lib/supabase/public';

export const runtime = 'nodejs';

function clean(value, max) {
  return String(value ?? '').trim().slice(0, max);
}

export async function POST(request) {
  const supabase = createPublicClient();
  if (!supabase) return Response.json({ error: 'Supabase is not configured.' }, { status: 503 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 200).toLowerCase();
  const subject = clean(body.subject, 180);
  const message = clean(body.message, 5000);
  const website = clean(body.website, 200);
  const startedAt = Number(body.startedAt || 0);
  const elapsed = Date.now() - startedAt;

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (website || !startedAt || elapsed < 900 || name.length < 2 || !validEmail || subject.length < 3 || message.length < 10) {
    return Response.json({ error: 'Please complete all fields correctly.' }, { status: 422 });
  }

  const { error } = await supabase.from('contact_messages').insert({ name, email, subject, message });
  if (error) return Response.json({ error: 'The message could not be saved.' }, { status: 500 });
  return Response.json({ ok: true }, { status: 201 });
}
