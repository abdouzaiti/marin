-- MARIN Academy Supabase Schema (No Service Role Key Required)
-- Run this SQL in your Supabase Dashboard -> SQL Editor

create extension if not exists pgcrypto;

-- 1. Profiles Table (with roles & registration request workflow)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  username text unique,
  full_name text not null default '',
  title text not null default 'Apprenant Professionnel',
  active_domain text default 'المالية الذكية',
  xp integer not null default 0,
  streak integer not null default 1,
  completed_modules text[] not null default '{}',
  role text not null default 'guest'
    check (role in ('guest', 'student', 'teacher', 'admin', 'developer')),
  requested_role text
    check (requested_role in ('student', 'teacher', 'admin', 'developer')),
  request_status text not null default 'pending'
    check (request_status in ('none', 'pending', 'approved', 'rejected')),
  request_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Safe migrations if profiles table already existed from an earlier run
alter table public.profiles
  add column if not exists requested_role text,
  add column if not exists request_status text not null default 'pending',
  add column if not exists request_note text not null default '';

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('guest', 'student', 'teacher', 'admin', 'developer'));

alter table public.profiles drop constraint if exists profiles_requested_role_check;
alter table public.profiles
  add constraint profiles_requested_role_check
  check (requested_role is null or requested_role in ('student', 'teacher', 'admin', 'developer'));

alter table public.profiles drop constraint if exists profiles_request_status_check;
alter table public.profiles
  add constraint profiles_request_status_check
  check (request_status in ('none', 'pending', 'approved', 'rejected'));

-- 2. Classes Table
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  domain text not null default 'المالية الذكية',
  teacher_id uuid references public.profiles(id) on delete set null,
  schedule text not null default '',
  capacity integer not null default 30,
  status text not null default 'active'
    check (status in ('active', 'draft', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Class Enrollments Table (Students <-> Classes)
create table if not exists public.class_enrollments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (class_id, student_id)
);

-- 4. Security Helper Functions (No Service Role Key Required)
create or replace function public.is_developer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'developer'
  );
$$;

create or replace function public.get_email_by_username(p_username text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select email
  from public.profiles
  where lower(username) = lower(trim(p_username))
  limit 1;
$$;

grant execute on function public.get_email_by_username(text) to anon, authenticated;

-- Prevent non-developers from self-escalating role or request_status
create or replace function public.protect_profile_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_developer() then
    new.role := old.role;
    if old.role = 'guest' and new.requested_role is distinct from old.requested_role then
      new.request_status := 'pending';
    else
      new.request_status := old.request_status;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_profile_privileged_fields on public.profiles;
create trigger trg_protect_profile_privileged_fields
  before update on public.profiles
  for each row execute procedure public.protect_profile_privileged_fields();

-- 5. Row-Level Security Policies
alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.class_enrollments enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Profiles select own or developer" on public.profiles;
create policy "Profiles select own or developer"
  on public.profiles for select
  using (auth.uid() = id or public.is_developer());

drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Profiles insert own or developer" on public.profiles;
create policy "Profiles insert own or developer"
  on public.profiles for insert
  with check (auth.uid() = id or public.is_developer());

drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Profiles update own or developer" on public.profiles;
create policy "Profiles update own or developer"
  on public.profiles for update
  using (auth.uid() = id or public.is_developer())
  with check (auth.uid() = id or public.is_developer());

drop policy if exists "Profiles delete developer only" on public.profiles;
create policy "Profiles delete developer only"
  on public.profiles for delete
  using (public.is_developer());

drop policy if exists "Classes select authenticated" on public.classes;
create policy "Classes select authenticated"
  on public.classes for select
  using (auth.role() = 'authenticated');

drop policy if exists "Classes insert developer" on public.classes;
create policy "Classes insert developer"
  on public.classes for insert
  with check (public.is_developer());

drop policy if exists "Classes update developer" on public.classes;
create policy "Classes update developer"
  on public.classes for update
  using (public.is_developer())
  with check (public.is_developer());

drop policy if exists "Classes delete developer" on public.classes;
create policy "Classes delete developer"
  on public.classes for delete
  using (public.is_developer());

drop policy if exists "Enrollments select own or developer" on public.class_enrollments;
create policy "Enrollments select own or developer"
  on public.class_enrollments for select
  using (auth.uid() = student_id or public.is_developer());

drop policy if exists "Enrollments insert developer" on public.class_enrollments;
create policy "Enrollments insert developer"
  on public.class_enrollments for insert
  with check (public.is_developer());

drop policy if exists "Enrollments delete developer" on public.class_enrollments;
create policy "Enrollments delete developer"
  on public.class_enrollments for delete
  using (public.is_developer());

-- 6. Automatically create a guest profile with pending role request on sign-up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_requested_role text;
  v_username text;
begin
  v_requested_role := case
    when (new.raw_user_meta_data->>'requested_role') in ('student', 'teacher')
      then new.raw_user_meta_data->>'requested_role'
    else 'student'
  end;

  v_username := nullif(trim(coalesce(new.raw_user_meta_data->>'username', '')), '');
  if v_username is not null and exists (
    select 1 from public.profiles where lower(username) = lower(v_username)
  ) then
    v_username := v_username || '_' || substr(new.id::text, 1, 4);
  end if;

  insert into public.profiles (
    id,
    email,
    full_name,
    username,
    active_domain,
    role,
    requested_role,
    request_status,
    request_note
  )
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, ''), '@', 1)),
    v_username,
    coalesce(nullif(new.raw_user_meta_data->>'active_domain', ''), 'المالية الذكية'),
    'guest',
    v_requested_role,
    'pending',
    coalesce(new.raw_user_meta_data->>'request_note', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill any auth.users created before this trigger was installed
insert into public.profiles (
  id,
  email,
  full_name,
  username,
  role,
  requested_role,
  request_status
)
select
  u.id,
  coalesce(u.email, ''),
  coalesce(u.raw_user_meta_data->>'full_name', split_part(coalesce(u.email, ''), '@', 1)),
  null,
  'guest',
  case
    when (u.raw_user_meta_data->>'requested_role') in ('student', 'teacher')
      then u.raw_user_meta_data->>'requested_role'
    else 'student'
  end,
  'pending'
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;

-- 7. Promote your primary account to Developer after signing up:
-- update public.profiles
-- set role = 'developer', request_status = 'approved'
-- where email = 'your-developer-email@example.com';
