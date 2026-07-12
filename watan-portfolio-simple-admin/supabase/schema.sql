-- Watan Portfolio: database, authentication roles, RLS and project image storage
-- Run this entire file in Supabase Dashboard > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) between 5 and 200),
  subject text not null check (char_length(subject) between 3 and 180),
  message text not null check (char_length(message) between 10 and 5000),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title_ku text not null check (char_length(title_ku) between 2 and 160),
  title_en text not null check (char_length(title_en) between 2 and 160),
  description_ku text not null check (char_length(description_ku) between 5 and 2000),
  description_en text not null check (char_length(description_en) between 5 and 2000),
  tech text[] not null default '{}',
  image_url text,
  image_path text,
  project_url text,
  github_url text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create or replace function public.is_portfolio_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

revoke all on function public.is_portfolio_admin() from public;
grant execute on function public.is_portfolio_admin() to anon, authenticated;

alter table public.admin_users enable row level security;
alter table public.contact_messages enable row level security;
alter table public.projects enable row level security;

-- Admin users can only see their own allow-list row.
drop policy if exists "admin reads own membership" on public.admin_users;
create policy "admin reads own membership"
on public.admin_users for select
to authenticated
using (user_id = auth.uid());

-- Anyone may submit a contact message, but nobody public can read it.
drop policy if exists "public inserts contact messages" on public.contact_messages;
create policy "public inserts contact messages"
on public.contact_messages for insert
to anon, authenticated
with check (true);

drop policy if exists "admins read contact messages" on public.contact_messages;
create policy "admins read contact messages"
on public.contact_messages for select
to authenticated
using (public.is_portfolio_admin());

drop policy if exists "admins update contact messages" on public.contact_messages;
create policy "admins update contact messages"
on public.contact_messages for update
to authenticated
using (public.is_portfolio_admin())
with check (public.is_portfolio_admin());

drop policy if exists "admins delete contact messages" on public.contact_messages;
create policy "admins delete contact messages"
on public.contact_messages for delete
to authenticated
using (public.is_portfolio_admin());

-- Published projects are public. Admins can manage every project.
drop policy if exists "public reads published projects" on public.projects;
create policy "public reads published projects"
on public.projects for select
to anon, authenticated
using (is_published = true or public.is_portfolio_admin());

drop policy if exists "admins insert projects" on public.projects;
create policy "admins insert projects"
on public.projects for insert
to authenticated
with check (public.is_portfolio_admin());

drop policy if exists "admins update projects" on public.projects;
create policy "admins update projects"
on public.projects for update
to authenticated
using (public.is_portfolio_admin())
with check (public.is_portfolio_admin());

drop policy if exists "admins delete projects" on public.projects;
create policy "admins delete projects"
on public.projects for delete
to authenticated
using (public.is_portfolio_admin());

-- Public project-image bucket. Upload/delete remains admin-only through RLS.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-images',
  'project-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public reads project images" on storage.objects;
create policy "public reads project images"
on storage.objects for select
to public
using (bucket_id = 'project-images');

drop policy if exists "admins upload project images" on storage.objects;
create policy "admins upload project images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'project-images' and public.is_portfolio_admin());

drop policy if exists "admins update project images" on storage.objects;
create policy "admins update project images"
on storage.objects for update
to authenticated
using (bucket_id = 'project-images' and public.is_portfolio_admin())
with check (bucket_id = 'project-images' and public.is_portfolio_admin());

drop policy if exists "admins delete project images" on storage.objects;
create policy "admins delete project images"
on storage.objects for delete
to authenticated
using (bucket_id = 'project-images' and public.is_portfolio_admin());

-- AFTER creating your user in Authentication > Users, replace the email and run:
-- insert into public.admin_users (user_id)
-- select id from auth.users where email = 'YOUR_EMAIL@example.com'
-- on conflict (user_id) do nothing;
