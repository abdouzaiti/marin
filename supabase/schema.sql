-- MARIN Academy Standalone Supabase Schema
-- Stores ALL users, passwords, roles, sessions, classes & enrollments directly in PostgreSQL tables
-- NO Supabase Auth (auth.users) and NO Service Role Key required!
-- Run this entire script in: Supabase Dashboard -> SQL Editor

create extension if not exists pgcrypto;

-- 1. Profiles Table (independent from auth.users)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  username text,
  password text not null default '',
  password_hash text not null default '',
  full_name text not null default '',
  title text not null default 'Apprenant Professionnel',
  active_domain text default 'المالية الذكية',
  xp integer not null default 0,
  streak integer not null default 1,
  completed_modules text[] not null default '{}',
  role text not null default 'guest'
    check (role in ('guest', 'student', 'teacher', 'admin', 'developer')),
  requested_role text
    check (requested_role is null or requested_role in ('student', 'teacher', 'admin', 'developer')),
  request_status text not null default 'pending'
    check (request_status in ('none', 'pending', 'approved', 'rejected')),
  request_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Detach any legacy foreign key to auth.users if profiles existed previously
do $$
declare
  r record;
begin
  for r in (
    select conname
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and contype = 'f'
  ) loop
    execute format('alter table public.profiles drop constraint %I', r.conname);
  end loop;
end $$;

do $$
begin
  execute 'drop trigger if exists on_auth_user_created on auth.users';
exception when others then
  null;
end $$;

drop trigger if exists trg_protect_profile_privileged_fields on public.profiles;

alter table public.profiles
  alter column id set default gen_random_uuid(),
  add column if not exists password text not null default '',
  add column if not exists password_hash text not null default '',
  add column if not exists requested_role text,
  add column if not exists request_status text not null default 'pending',
  add column if not exists request_note text not null default '',
  add column if not exists updated_at timestamptz not null default now();

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

create unique index if not exists idx_profiles_email_lower
  on public.profiles (lower(email));

create unique index if not exists idx_profiles_username_lower
  on public.profiles (lower(username))
  where username is not null and trim(username) <> '';

-- 2. User Sessions Table (server-verified hashed session tokens)
create table if not exists public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null default (now() + interval '30 days'),
  created_at timestamptz not null default now()
);

create index if not exists idx_user_sessions_token_hash on public.user_sessions(token_hash);
create index if not exists idx_user_sessions_expires_at on public.user_sessions(expires_at);

-- 3. Classes Table
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  domain text not null default 'المالية الذكية',
  description text not null default '',
  teacher_id uuid references public.profiles(id) on delete set null,
  schedule text not null default '',
  capacity integer not null default 30,
  status text not null default 'active'
    check (status in ('active', 'draft', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.classes add column if not exists description text not null default '';

-- 4. Class Enrollments Table (Students <-> Classes)
create table if not exists public.class_enrollments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'approved'
    check (status in ('pending', 'approved', 'rejected')),
  request_message text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_id, student_id)
);

alter table public.class_enrollments add column if not exists status text not null default 'approved' check (status in ('pending', 'approved', 'rejected'));
alter table public.class_enrollments add column if not exists request_message text default '';
alter table public.class_enrollments add column if not exists updated_at timestamptz not null default now();

-- 5. Lock down direct table access via RLS (only SECURITY DEFINER RPCs mutate/read)
alter table public.profiles enable row level security;
alter table public.user_sessions enable row level security;
alter table public.classes enable row level security;
alter table public.class_enrollments enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Profiles select own or developer" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Profiles insert own or developer" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Profiles update own or developer" on public.profiles;
drop policy if exists "Profiles delete developer only" on public.profiles;

drop policy if exists "Classes select authenticated" on public.classes;
drop policy if exists "Classes insert developer" on public.classes;
drop policy if exists "Classes update developer" on public.classes;
drop policy if exists "Classes delete developer" on public.classes;

drop policy if exists "Enrollments select own or developer" on public.class_enrollments;
drop policy if exists "Enrollments insert developer" on public.class_enrollments;
drop policy if exists "Enrollments delete developer" on public.class_enrollments;

-- 6. Internal Helpers (Never directly callable via API)
create or replace function public._profile_to_json(p public.profiles)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'id', p.id,
    'email', p.email,
    'username', p.username,
    'password', p.password,
    'full_name', p.full_name,
    'title', p.title,
    'active_domain', p.active_domain,
    'xp', p.xp,
    'streak', p.streak,
    'completed_modules', coalesce(p.completed_modules, '{}'::text[]),
    'role', p.role,
    'requested_role', p.requested_role,
    'request_status', p.request_status,
    'request_note', p.request_note,
    'created_at', p.created_at
  );
$$;

create or replace function public._resolve_session_profile_id(p_token_hash text)
returns uuid
language sql
security definer
set search_path = public, extensions
as $$
  select s.profile_id
  from public.user_sessions s
  where s.token_hash = p_token_hash
    and s.expires_at > now()
  limit 1;
$$;

revoke all on function public._profile_to_json(public.profiles) from public, anon, authenticated;
revoke all on function public._resolve_session_profile_id(text) from public, anon, authenticated;

-- 7. Public Auth & Profile RPCs (Direct profiles table auth)

create or replace function public.marin_register_profile(
  p_email text,
  p_password text,
  p_full_name text,
  p_username text,
  p_requested_role text default 'student',
  p_request_note text default '',
  p_active_domain text default 'المالية الذكية',
  p_token_hash text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_email text;
  v_username text;
  v_full_name text;
  v_req_role text;
  v_domain text;
  v_profile public.profiles;
begin
  v_email := lower(trim(coalesce(p_email, '')));
  v_username := nullif(trim(coalesce(p_username, '')), '');
  v_full_name := trim(coalesce(p_full_name, ''));
  v_req_role := case when p_requested_role in ('student', 'teacher') then p_requested_role else 'student' end;
  v_domain := coalesce(nullif(trim(coalesce(p_active_domain, '')), ''), 'المالية الذكية');

  if v_email = '' or position('@' in v_email) = 0 then
    raise exception 'INVALID_EMAIL';
  end if;
  if coalesce(length(p_password), 0) < 6 then
    raise exception 'INVALID_PASSWORD';
  end if;
  if v_full_name = '' then
    raise exception 'FULL_NAME_REQUIRED';
  end if;
  if p_token_hash is null or trim(p_token_hash) = '' then
    raise exception 'SESSION_TOKEN_REQUIRED';
  end if;

  if exists (select 1 from public.profiles where lower(email) = v_email) then
    raise exception 'EMAIL_EXISTS';
  end if;

  if v_username is not null and exists (
    select 1 from public.profiles where lower(username) = lower(v_username)
  ) then
    raise exception 'USERNAME_EXISTS';
  end if;

  insert into public.profiles (
    email,
    username,
    password,
    password_hash,
    full_name,
    active_domain,
    role,
    requested_role,
    request_status,
    request_note
  )
  values (
    v_email,
    v_username,
    p_password,
    crypt(p_password, gen_salt('bf', 10)),
    v_full_name,
    v_domain,
    'guest',
    v_req_role,
    'pending',
    left(trim(coalesce(p_request_note, '')), 300)
  )
  returning * into v_profile;

  delete from public.user_sessions where expires_at <= now();

  insert into public.user_sessions (profile_id, token_hash, expires_at)
  values (v_profile.id, p_token_hash, now() + interval '30 days');

  return public._profile_to_json(v_profile);
end;
$$;

create or replace function public.marin_login_profile(
  p_identifier text,
  p_password text,
  p_token_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_ident text;
  v_profile public.profiles;
begin
  v_ident := lower(trim(coalesce(p_identifier, '')));
  if v_ident = '' or coalesce(p_password, '') = '' then
    raise exception 'INVALID_CREDENTIALS';
  end if;
  if p_token_hash is null or trim(p_token_hash) = '' then
    raise exception 'SESSION_TOKEN_REQUIRED';
  end if;

  select *
  into v_profile
  from public.profiles
  where lower(email) = v_ident
     or (username is not null and lower(username) = v_ident)
  limit 1;

  if not found then
    raise exception 'INVALID_CREDENTIALS';
  end if;

  if coalesce(v_profile.password_hash, '') = '' then
    raise exception 'PASSWORD_NOT_SET';
  end if;

  if crypt(p_password, v_profile.password_hash) <> v_profile.password_hash then
    raise exception 'INVALID_CREDENTIALS';
  end if;

  if coalesce(v_profile.password, '') = '' or v_profile.password <> p_password then
    update public.profiles set password = p_password, updated_at = now() where id = v_profile.id;
    v_profile.password := p_password;
  end if;

  delete from public.user_sessions where expires_at <= now();

  insert into public.user_sessions (profile_id, token_hash, expires_at)
  values (v_profile.id, p_token_hash, now() + interval '30 days');

  return public._profile_to_json(v_profile);
end;
$$;

create or replace function public.marin_get_session(p_token_hash text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_profile_id uuid;
  v_profile public.profiles;
begin
  if p_token_hash is null or trim(p_token_hash) = '' then
    return null;
  end if;

  v_profile_id := public._resolve_session_profile_id(p_token_hash);
  if v_profile_id is null then
    return null;
  end if;

  select * into v_profile from public.profiles where id = v_profile_id;
  if not found then
    return null;
  end if;

  return public._profile_to_json(v_profile);
end;
$$;

create or replace function public.marin_logout_session(p_token_hash text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  delete from public.user_sessions where token_hash = p_token_hash;
  return true;
end;
$$;

create or replace function public.marin_update_profile(
  p_token_hash text,
  p_full_name text default null,
  p_title text default null,
  p_active_domain text default null,
  p_username text default null,
  p_new_password text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_profile_id uuid;
  v_clean_username text;
  v_profile public.profiles;
begin
  v_profile_id := public._resolve_session_profile_id(p_token_hash);
  if v_profile_id is null then
    raise exception 'UNAUTHORIZED';
  end if;

  v_clean_username := nullif(trim(coalesce(p_username, '')), '');
  if v_clean_username is not null and exists (
    select 1
    from public.profiles
    where lower(username) = lower(v_clean_username)
      and id <> v_profile_id
  ) then
    raise exception 'USERNAME_EXISTS';
  end if;

  update public.profiles
  set
    full_name = coalesce(nullif(trim(p_full_name), ''), full_name),
    title = case
      when p_title is not null then coalesce(nullif(trim(p_title), ''), 'Apprenant Professionnel')
      else title
    end,
    active_domain = case
      when p_active_domain is not null then nullif(trim(p_active_domain), '')
      else active_domain
    end,
    username = coalesce(v_clean_username, username),
    password = case
      when p_new_password is not null and trim(p_new_password) <> '' then trim(p_new_password)
      else password
    end,
    password_hash = case
      when p_new_password is not null and trim(p_new_password) <> '' then crypt(p_new_password, gen_salt('bf', 10))
      else password_hash
    end,
    updated_at = now()
  where id = v_profile_id
  returning * into v_profile;

  return public._profile_to_json(v_profile);
end;
$$;

create or replace function public.marin_request_role(
  p_token_hash text,
  p_requested_role text,
  p_request_note text default '',
  p_active_domain text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_profile_id uuid;
  v_profile public.profiles;
begin
  v_profile_id := public._resolve_session_profile_id(p_token_hash);
  if v_profile_id is null then
    raise exception 'UNAUTHORIZED';
  end if;

  if p_requested_role not in ('student', 'teacher') then
    raise exception 'INVALID_REQUESTED_ROLE';
  end if;

  select * into v_profile from public.profiles where id = v_profile_id;
  if v_profile.role <> 'guest' then
    raise exception 'ALREADY_ASSIGNED_ROLE';
  end if;

  update public.profiles
  set
    requested_role = p_requested_role,
    request_status = 'pending',
    request_note = left(trim(coalesce(p_request_note, '')), 300),
    active_domain = coalesce(nullif(trim(coalesce(p_active_domain, '')), ''), active_domain),
    updated_at = now()
  where id = v_profile_id
  returning * into v_profile;

  return public._profile_to_json(v_profile);
end;
$$;

create or replace function public.marin_complete_module(
  p_token_hash text,
  p_module_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_profile_id uuid;
  v_profile public.profiles;
  v_clean_id text;
begin
  v_profile_id := public._resolve_session_profile_id(p_token_hash);
  if v_profile_id is null then
    raise exception 'UNAUTHORIZED';
  end if;

  v_clean_id := trim(coalesce(p_module_id, ''));
  if v_clean_id = '' then
    raise exception 'INVALID_MODULE_ID';
  end if;

  select * into v_profile from public.profiles where id = v_profile_id;
  if not (v_clean_id = any(coalesce(v_profile.completed_modules, '{}'::text[]))) then
    update public.profiles
    set
      completed_modules = array_append(coalesce(completed_modules, '{}'::text[]), v_clean_id),
      xp = xp + 100,
      updated_at = now()
    where id = v_profile_id
    returning * into v_profile;
  end if;

  return public._profile_to_json(v_profile);
end;
$$;

-- 8. Developer Dashboard & Management RPCs

create or replace function public.marin_dev_dashboard(p_token_hash text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_caller_id uuid;
  v_caller_role text;
  v_profiles jsonb;
  v_classes jsonb;
  v_enrollments jsonb;
begin
  v_caller_id := public._resolve_session_profile_id(p_token_hash);
  if v_caller_id is null then
    raise exception 'UNAUTHORIZED';
  end if;

  select role into v_caller_role from public.profiles where id = v_caller_id;
  if v_caller_role <> 'developer' then
    raise exception 'FORBIDDEN';
  end if;

  select coalesce(jsonb_agg(public._profile_to_json(p) order by p.created_at desc), '[]'::jsonb)
  into v_profiles
  from public.profiles p;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', c.id,
    'title', c.title,
    'domain', c.domain,
    'teacher_id', c.teacher_id,
    'schedule', c.schedule,
    'capacity', c.capacity,
    'status', c.status,
    'created_at', c.created_at
  ) order by c.created_at desc), '[]'::jsonb)
  into v_classes
  from public.classes c;

  select coalesce(jsonb_agg(jsonb_build_object(
    'class_id', e.class_id,
    'student_id', e.student_id
  )), '[]'::jsonb)
  into v_enrollments
  from public.class_enrollments e;

  return jsonb_build_object(
    'profiles', v_profiles,
    'classes', v_classes,
    'enrollments', v_enrollments
  );
end;
$$;

create or replace function public.marin_dev_create_user(
  p_token_hash text,
  p_email text,
  p_password text,
  p_full_name text,
  p_username text default null,
  p_role text default 'student',
  p_title text default null,
  p_active_domain text default 'المالية الذكية'
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_caller_id uuid;
  v_caller_role text;
  v_email text;
  v_username text;
  v_role text;
  v_title text;
  v_domain text;
  v_profile public.profiles;
begin
  v_caller_id := public._resolve_session_profile_id(p_token_hash);
  if v_caller_id is null then
    raise exception 'UNAUTHORIZED';
  end if;

  select role into v_caller_role from public.profiles where id = v_caller_id;
  if v_caller_role <> 'developer' then
    raise exception 'FORBIDDEN';
  end if;

  v_email := lower(trim(coalesce(p_email, '')));
  v_username := nullif(trim(coalesce(p_username, '')), '');
  v_role := case when p_role in ('guest', 'student', 'teacher', 'admin', 'developer') then p_role else 'student' end;
  v_domain := coalesce(nullif(trim(coalesce(p_active_domain, '')), ''), 'المالية الذكية');
  v_title := coalesce(
    nullif(trim(coalesce(p_title, '')), ''),
    case
      when v_role = 'teacher' then 'Formateur Expert'
      when v_role = 'admin' then 'Administrateur'
      when v_role = 'developer' then 'Développeur Plateforme'
      else 'Apprenant Professionnel'
    end
  );

  if exists (select 1 from public.profiles where lower(email) = v_email) then
    raise exception 'EMAIL_EXISTS';
  end if;
  if v_username is not null and exists (
    select 1 from public.profiles where lower(username) = lower(v_username)
  ) then
    raise exception 'USERNAME_EXISTS';
  end if;

  insert into public.profiles (
    email,
    username,
    password,
    password_hash,
    full_name,
    title,
    active_domain,
    role,
    requested_role,
    request_status
  )
  values (
    v_email,
    v_username,
    p_password,
    crypt(p_password, gen_salt('bf', 10)),
    trim(coalesce(p_full_name, '')),
    v_title,
    v_domain,
    v_role,
    case when v_role = 'guest' then 'student' else v_role end,
    case when v_role = 'guest' then 'pending' else 'approved' end
  )
  returning * into v_profile;

  return public._profile_to_json(v_profile);
end;
$$;

create or replace function public.marin_dev_set_user_role(
  p_token_hash text,
  p_target_user_id uuid,
  p_role text,
  p_request_status text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_caller_id uuid;
  v_caller_role text;
  v_status text;
  v_profile public.profiles;
begin
  v_caller_id := public._resolve_session_profile_id(p_token_hash);
  if v_caller_id is null then
    raise exception 'UNAUTHORIZED';
  end if;

  select role into v_caller_role from public.profiles where id = v_caller_id;
  if v_caller_role <> 'developer' then
    raise exception 'FORBIDDEN';
  end if;

  if p_role not in ('guest', 'student', 'teacher', 'admin', 'developer') then
    raise exception 'INVALID_ROLE';
  end if;

  if p_target_user_id = v_caller_id and p_role <> 'developer' then
    raise exception 'CANNOT_DEMOTE_SELF';
  end if;

  v_status := case
    when p_request_status in ('none', 'pending', 'approved', 'rejected') then p_request_status
    when p_role = 'guest' then 'rejected'
    else 'approved'
  end;

  update public.profiles
  set
    role = p_role,
    request_status = v_status,
    updated_at = now()
  where id = p_target_user_id
  returning * into v_profile;

  if not found then
    raise exception 'USER_NOT_FOUND';
  end if;

  return public._profile_to_json(v_profile);
end;
$$;

create or replace function public.marin_dev_create_class(
  p_token_hash text,
  p_title text,
  p_domain text default 'المالية الذكية',
  p_teacher_id uuid default null,
  p_schedule text default '',
  p_capacity integer default 30,
  p_status text default 'active'
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_caller_id uuid;
  v_caller_role text;
  v_class public.classes;
begin
  v_caller_id := public._resolve_session_profile_id(p_token_hash);
  if v_caller_id is null then
    raise exception 'UNAUTHORIZED';
  end if;
  select role into v_caller_role from public.profiles where id = v_caller_id;
  if v_caller_role <> 'developer' then
    raise exception 'FORBIDDEN';
  end if;

  insert into public.classes (title, domain, teacher_id, schedule, capacity, status)
  values (
    trim(p_title),
    coalesce(nullif(trim(coalesce(p_domain, '')), ''), 'المالية الذكية'),
    p_teacher_id,
    trim(coalesce(p_schedule, '')),
    greatest(1, least(coalesce(p_capacity, 30), 500)),
    case when p_status in ('active', 'draft', 'archived') then p_status else 'active' end
  )
  returning * into v_class;

  return to_jsonb(v_class);
end;
$$;

create or replace function public.marin_dev_update_class(
  p_token_hash text,
  p_class_id uuid,
  p_title text default null,
  p_domain text default null,
  p_teacher_id uuid default null,
  p_clear_teacher boolean default false,
  p_schedule text default null,
  p_capacity integer default null,
  p_status text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_caller_id uuid;
  v_caller_role text;
  v_class public.classes;
begin
  v_caller_id := public._resolve_session_profile_id(p_token_hash);
  if v_caller_id is null then
    raise exception 'UNAUTHORIZED';
  end if;
  select role into v_caller_role from public.profiles where id = v_caller_id;
  if v_caller_role <> 'developer' then
    raise exception 'FORBIDDEN';
  end if;

  update public.classes
  set
    title = coalesce(nullif(trim(p_title), ''), title),
    domain = coalesce(nullif(trim(p_domain), ''), domain),
    teacher_id = case when p_clear_teacher then null else coalesce(p_teacher_id, teacher_id) end,
    schedule = coalesce(p_schedule, schedule),
    capacity = coalesce(p_capacity, capacity),
    status = case when p_status in ('active', 'draft', 'archived') then p_status else status end,
    updated_at = now()
  where id = p_class_id
  returning * into v_class;

  return to_jsonb(v_class);
end;
$$;

create or replace function public.marin_dev_delete_class(
  p_token_hash text,
  p_class_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_caller_id uuid;
  v_caller_role text;
begin
  v_caller_id := public._resolve_session_profile_id(p_token_hash);
  if v_caller_id is null then
    raise exception 'UNAUTHORIZED';
  end if;
  select role into v_caller_role from public.profiles where id = v_caller_id;
  if v_caller_role <> 'developer' then
    raise exception 'FORBIDDEN';
  end if;

  delete from public.classes where id = p_class_id;
  return true;
end;
$$;

create or replace function public.marin_dev_set_class_enrollments(
  p_token_hash text,
  p_class_id uuid,
  p_student_ids uuid[]
)
returns uuid[]
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_caller_id uuid;
  v_caller_role text;
  v_sid uuid;
begin
  v_caller_id := public._resolve_session_profile_id(p_token_hash);
  if v_caller_id is null then
    raise exception 'UNAUTHORIZED';
  end if;
  select role into v_caller_role from public.profiles where id = v_caller_id;
  if v_caller_role <> 'developer' then
    raise exception 'FORBIDDEN';
  end if;

  delete from public.class_enrollments where class_id = p_class_id;

  if p_student_ids is not null then
    foreach v_sid in array p_student_ids loop
      insert into public.class_enrollments (class_id, student_id)
      values (p_class_id, v_sid)
      on conflict (class_id, student_id) do nothing;
    end loop;
  end if;

  return coalesce(p_student_ids, '{}'::uuid[]);
end;
$$;

create or replace function public.marin_dev_update_user_full(
  p_token_hash text,
  p_target_user_id uuid,
  p_full_name text default null,
  p_email text default null,
  p_username text default null,
  p_role text default null,
  p_title text default null,
  p_active_domain text default null,
  p_new_password text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_caller_id uuid;
  v_caller_role text;
  v_profile public.profiles;
  v_email text;
  v_username text;
  v_role text;
begin
  v_caller_id := public._resolve_session_profile_id(p_token_hash);
  if v_caller_id is null then
    raise exception 'UNAUTHORIZED';
  end if;

  select role into v_caller_role from public.profiles where id = v_caller_id;
  if v_caller_role <> 'developer' then
    raise exception 'FORBIDDEN';
  end if;

  select * into v_profile from public.profiles where id = p_target_user_id;
  if not found then
    raise exception 'USER_NOT_FOUND';
  end if;

  v_email := coalesce(nullif(lower(trim(p_email)), ''), v_profile.email);
  v_username := nullif(trim(coalesce(p_username, v_profile.username)), '');
  v_role := case when p_role in ('guest', 'student', 'teacher', 'admin', 'developer') then p_role else v_profile.role end;

  if v_email <> v_profile.email and exists (select 1 from public.profiles where lower(email) = v_email and id <> p_target_user_id) then
    raise exception 'EMAIL_EXISTS';
  end if;

  if v_username is not null and v_username <> coalesce(v_profile.username, '') and exists (select 1 from public.profiles where lower(username) = lower(v_username) and id <> p_target_user_id) then
    raise exception 'USERNAME_EXISTS';
  end if;

  update public.profiles
  set
    email = v_email,
    username = v_username,
    full_name = coalesce(nullif(trim(p_full_name), ''), full_name),
    role = v_role,
    title = coalesce(nullif(trim(p_title), ''), title),
    active_domain = case when p_active_domain is not null then nullif(trim(p_active_domain), '') else active_domain end,
    password = case 
      when p_new_password is not null and trim(p_new_password) <> '' then trim(p_new_password)
      else password
    end,
    password_hash = case 
      when p_new_password is not null and trim(p_new_password) <> '' then crypt(p_new_password, gen_salt('bf', 10))
      else password_hash
    end,
    updated_at = now()
  where id = p_target_user_id
  returning * into v_profile;

  return public._profile_to_json(v_profile);
end;
$$;

-- ============================================================================
-- 9. Teacher Dashboard & Student Access Control RPCs
-- ============================================================================

create or replace function public.marin_teacher_dashboard(p_token_hash text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_caller_id uuid;
  v_caller_role text;
  v_teacher jsonb;
  v_classes jsonb;
  v_requests jsonb;
  v_enrolled jsonb;
begin
  v_caller_id := public._resolve_session_profile_id(p_token_hash);
  if v_caller_id is null then
    raise exception 'UNAUTHORIZED';
  end if;

  select role into v_caller_role from public.profiles where id = v_caller_id;
  if v_caller_role <> 'teacher' and v_caller_role <> 'developer' then
    raise exception 'TEACHER_ACCESS_REQUIRED';
  end if;

  select public._profile_to_json(p) into v_teacher from public.profiles p where p.id = v_caller_id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', c.id,
    'title', c.title,
    'domain', c.domain,
    'description', c.description,
    'teacher_id', c.teacher_id,
    'schedule', c.schedule,
    'capacity', c.capacity,
    'status', c.status,
    'created_at', c.created_at,
    'student_count', (select count(*) from public.class_enrollments e where e.class_id = c.id and e.status = 'approved'),
    'pending_count', (select count(*) from public.class_enrollments e where e.class_id = c.id and e.status = 'pending')
  ) order by c.created_at desc), '[]'::jsonb)
  into v_classes
  from public.classes c
  where (v_caller_role = 'developer' or c.teacher_id = v_caller_id);

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', e.id,
    'class_id', e.class_id,
    'class_title', c.title,
    'class_domain', c.domain,
    'student_id', s.id,
    'student_name', coalesce(nullif(trim(s.full_name), ''), nullif(trim(s.username), ''), split_part(s.email, '@', 1), 'Étudiant'),
    'student_email', s.email,
    'student_username', coalesce(s.username, ''),
    'student_title', coalesce(s.title, 'Apprenant Professionnel'),
    'student_domain', coalesce(s.active_domain, 'المالية الذكية'),
    'student_xp', coalesce(s.xp, 0),
    'message', coalesce(e.request_message, ''),
    'status', e.status,
    'created_at', coalesce(e.updated_at, e.created_at, now()),
    'request_date', coalesce(e.updated_at, e.created_at, now()),
    'updated_at', coalesce(e.updated_at, e.created_at, now())
  ) order by coalesce(e.updated_at, e.created_at) desc), '[]'::jsonb)
  into v_requests
  from public.class_enrollments e
  join public.classes c on c.id = e.class_id
  join public.profiles s on s.id = e.student_id
  where (v_caller_role = 'developer' or c.teacher_id = v_caller_id)
    and e.status = 'pending';

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', e.id,
    'class_id', e.class_id,
    'class_title', c.title,
    'student_id', s.id,
    'student_name', coalesce(nullif(trim(s.full_name), ''), nullif(trim(s.username), ''), split_part(s.email, '@', 1), 'Étudiant'),
    'student_email', s.email,
    'student_username', coalesce(s.username, ''),
    'student_title', coalesce(s.title, 'Apprenant Professionnel'),
    'student_domain', coalesce(s.active_domain, 'المالية الذكية'),
    'student_xp', coalesce(s.xp, 0),
    'status', e.status,
    'enrolled_at', coalesce(e.updated_at, e.created_at, now())
  ) order by s.full_name asc), '[]'::jsonb)
  into v_enrolled
  from public.class_enrollments e
  join public.classes c on c.id = e.class_id
  join public.profiles s on s.id = e.student_id
  where (v_caller_role = 'developer' or c.teacher_id = v_caller_id)
    and e.status = 'approved';

  return jsonb_build_object(
    'teacher', v_teacher,
    'classes', v_classes,
    'requests', v_requests,
    'enrolledStudents', v_enrolled
  );
end;
$$;

create or replace function public.marin_teacher_create_class(
  p_token_hash text,
  p_title text,
  p_domain text default 'المالية الذكية',
  p_schedule text default '',
  p_capacity integer default 30,
  p_status text default 'active',
  p_description text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_caller_id uuid;
  v_caller_role text;
  v_class public.classes;
begin
  v_caller_id := public._resolve_session_profile_id(p_token_hash);
  if v_caller_id is null then
    raise exception 'UNAUTHORIZED';
  end if;

  select role into v_caller_role from public.profiles where id = v_caller_id;
  if v_caller_role <> 'teacher' and v_caller_role <> 'developer' then
    raise exception 'TEACHER_ACCESS_REQUIRED';
  end if;

  insert into public.classes (title, domain, description, teacher_id, schedule, capacity, status)
  values (
    trim(p_title),
    coalesce(nullif(trim(coalesce(p_domain, '')), ''), 'المالية الذكية'),
    trim(coalesce(p_description, '')),
    v_caller_id,
    trim(coalesce(p_schedule, '')),
    greatest(1, least(coalesce(p_capacity, 30), 500)),
    case when p_status in ('active', 'draft', 'archived') then p_status else 'active' end
  )
  returning * into v_class;

  return jsonb_build_object(
    'id', v_class.id,
    'title', v_class.title,
    'domain', v_class.domain,
    'description', v_class.description,
    'teacher_id', v_class.teacher_id,
    'schedule', v_class.schedule,
    'capacity', v_class.capacity,
    'status', v_class.status,
    'created_at', v_class.created_at,
    'student_count', 0,
    'pending_count', 0
  );
end;
$$;

create or replace function public.marin_teacher_update_class(
  p_token_hash text,
  p_class_id uuid,
  p_title text default null,
  p_domain text default null,
  p_schedule text default null,
  p_capacity integer default null,
  p_status text default null,
  p_description text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_caller_id uuid;
  v_caller_role text;
  v_class public.classes;
begin
  v_caller_id := public._resolve_session_profile_id(p_token_hash);
  if v_caller_id is null then
    raise exception 'UNAUTHORIZED';
  end if;

  select role into v_caller_role from public.profiles where id = v_caller_id;
  if v_caller_role <> 'teacher' and v_caller_role <> 'developer' then
    raise exception 'TEACHER_ACCESS_REQUIRED';
  end if;

  select * into v_class from public.classes where id = p_class_id;
  if not found then
    raise exception 'CLASS_NOT_FOUND';
  end if;

  if v_caller_role <> 'developer' and v_class.teacher_id <> v_caller_id then
    raise exception 'NOT_CLASS_TEACHER';
  end if;

  update public.classes
  set
    title = coalesce(nullif(trim(p_title), ''), title),
    domain = coalesce(nullif(trim(p_domain), ''), domain),
    schedule = coalesce(nullif(trim(p_schedule), ''), schedule),
    capacity = case when p_capacity is not null then greatest(1, least(p_capacity, 500)) else capacity end,
    status = case when p_status in ('active', 'draft', 'archived') then p_status else status end,
    description = case when p_description is not null then trim(p_description) else description end,
    updated_at = now()
  where id = p_class_id
  returning * into v_class;

  return jsonb_build_object(
    'id', v_class.id,
    'title', v_class.title,
    'domain', v_class.domain,
    'description', v_class.description,
    'teacher_id', v_class.teacher_id,
    'schedule', v_class.schedule,
    'capacity', v_class.capacity,
    'status', v_class.status,
    'created_at', v_class.created_at,
    'student_count', (select count(*) from public.class_enrollments where class_id = v_class.id and status = 'approved'),
    'pending_count', (select count(*) from public.class_enrollments where class_id = v_class.id and status = 'pending')
  );
end;
$$;

create or replace function public.marin_teacher_delete_class(
  p_token_hash text,
  p_class_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_caller_id uuid;
  v_caller_role text;
  v_class public.classes;
begin
  v_caller_id := public._resolve_session_profile_id(p_token_hash);
  if v_caller_id is null then
    raise exception 'UNAUTHORIZED';
  end if;

  select role into v_caller_role from public.profiles where id = v_caller_id;
  if v_caller_role <> 'teacher' and v_caller_role <> 'developer' then
    raise exception 'TEACHER_ACCESS_REQUIRED';
  end if;

  select * into v_class from public.classes where id = p_class_id;
  if not found then
    raise exception 'CLASS_NOT_FOUND';
  end if;

  if v_caller_role <> 'developer' and v_class.teacher_id <> v_caller_id then
    raise exception 'NOT_CLASS_TEACHER';
  end if;

  delete from public.classes where id = p_class_id;
  return true;
end;
$$;

create or replace function public.marin_teacher_set_student_access(
  p_token_hash text,
  p_class_id uuid,
  p_student_id uuid,
  p_decision text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_caller_id uuid;
  v_caller_role text;
  v_class public.classes;
begin
  v_caller_id := public._resolve_session_profile_id(p_token_hash);
  if v_caller_id is null then
    raise exception 'UNAUTHORIZED';
  end if;

  select role into v_caller_role from public.profiles where id = v_caller_id;
  if v_caller_role <> 'teacher' and v_caller_role <> 'developer' then
    raise exception 'TEACHER_ACCESS_REQUIRED';
  end if;

  select * into v_class from public.classes where id = p_class_id;
  if not found then
    raise exception 'CLASS_NOT_FOUND';
  end if;

  if v_caller_role <> 'developer' and v_class.teacher_id <> v_caller_id then
    raise exception 'NOT_CLASS_TEACHER';
  end if;

  if p_decision = 'removed' then
    delete from public.class_enrollments
    where class_id = p_class_id and student_id = p_student_id;
  elsif p_decision in ('approved', 'rejected') then
    insert into public.class_enrollments (class_id, student_id, status, updated_at)
    values (p_class_id, p_student_id, p_decision, now())
    on conflict (class_id, student_id)
    do update set status = p_decision, updated_at = now();
  else
    raise exception 'INVALID_DECISION';
  end if;

  return jsonb_build_object(
    'class_id', p_class_id,
    'student_id', p_student_id,
    'status', p_decision
  );
end;
$$;

-- ============================================================================
-- 10. Student Classes & Real-Time Access Requests RPCs
-- ============================================================================

create or replace function public.marin_student_classes_dashboard(p_token_hash text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_caller_id uuid;
  v_classes jsonb;
  v_my_enrolled jsonb;
begin
  v_caller_id := public._resolve_session_profile_id(p_token_hash);

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', c.id,
    'title', c.title,
    'domain', c.domain,
    'description', c.description,
    'teacher_id', c.teacher_id,
    'teacher_name', coalesce(t.full_name, 'Professeur MARIN'),
    'teacher_email', coalesce(t.email, ''),
    'teacher_title', coalesce(t.title, 'Formateur Expert'),
    'schedule', c.schedule,
    'capacity', c.capacity,
    'status', c.status,
    'created_at', c.created_at,
    'student_count', (select count(*) from public.class_enrollments e where e.class_id = c.id and e.status = 'approved'),
    'access_status', (
      case 
        when v_caller_id is null then 'none'
        else coalesce((select e.status from public.class_enrollments e where e.class_id = c.id and e.student_id = v_caller_id limit 1), 'none')
      end
    ),
    'access_message', (
      case 
        when v_caller_id is null then ''
        else coalesce((select e.request_message from public.class_enrollments e where e.class_id = c.id and e.student_id = v_caller_id limit 1), '')
      end
    )
  ) order by c.created_at desc), '[]'::jsonb)
  into v_classes
  from public.classes c
  left join public.profiles t on t.id = c.teacher_id
  where c.status = 'active';

  if v_caller_id is not null then
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', c.id,
      'title', c.title,
      'domain', c.domain,
      'description', c.description,
      'teacher_id', c.teacher_id,
      'teacher_name', coalesce(t.full_name, 'Professeur MARIN'),
      'teacher_email', coalesce(t.email, ''),
      'teacher_title', coalesce(t.title, 'Formateur Expert'),
      'schedule', c.schedule,
      'capacity', c.capacity,
      'status', c.status,
      'created_at', c.created_at,
      'enrolled_at', e.created_at,
      'student_count', (select count(*) from public.class_enrollments e2 where e2.class_id = c.id and e2.status = 'approved')
    ) order by e.created_at desc), '[]'::jsonb)
    into v_my_enrolled
    from public.class_enrollments e
    join public.classes c on c.id = e.class_id
    left join public.profiles t on t.id = c.teacher_id
    where e.student_id = v_caller_id and e.status = 'approved';
  else
    v_my_enrolled := '[]'::jsonb;
  end if;

  return jsonb_build_object(
    'classes', v_classes,
    'myClasses', v_my_enrolled
  );
end;
$$;

create or replace function public.marin_student_request_access(
  p_token_hash text,
  p_class_id uuid,
  p_message text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_caller_id uuid;
  v_class public.classes;
  v_enrollment public.class_enrollments;
begin
  v_caller_id := public._resolve_session_profile_id(p_token_hash);
  if v_caller_id is null then
    raise exception 'UNAUTHORIZED';
  end if;

  select * into v_class from public.classes where id = p_class_id;
  if not found then
    raise exception 'CLASS_NOT_FOUND';
  end if;

  if v_class.status <> 'active' then
    raise exception 'CLASS_NOT_ACTIVE';
  end if;

  insert into public.class_enrollments (class_id, student_id, status, request_message, updated_at)
  values (p_class_id, v_caller_id, 'pending', trim(coalesce(p_message, '')), now())
  on conflict (class_id, student_id)
  do update set status = 'pending', request_message = trim(coalesce(p_message, '')), updated_at = now()
  returning * into v_enrollment;

  return jsonb_build_object(
    'class_id', v_enrollment.class_id,
    'student_id', v_enrollment.student_id,
    'status', v_enrollment.status,
    'message', v_enrollment.request_message,
    'updated_at', v_enrollment.updated_at
  );
end;
$$;

create or replace function public.marin_student_cancel_request(
  p_token_hash text,
  p_class_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_caller_id uuid;
begin
  v_caller_id := public._resolve_session_profile_id(p_token_hash);
  if v_caller_id is null then
    raise exception 'UNAUTHORIZED';
  end if;

  delete from public.class_enrollments
  where class_id = p_class_id and student_id = v_caller_id and status = 'pending';

  return true;
end;
$$;

-- ============================================================================
-- 11. RPC Grants
-- ============================================================================

grant execute on function public.marin_register_profile(text, text, text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.marin_login_profile(text, text, text) to anon, authenticated;
grant execute on function public.marin_get_session(text) to anon, authenticated;
grant execute on function public.marin_logout_session(text) to anon, authenticated;
grant execute on function public.marin_update_profile(text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.marin_request_role(text, text, text, text) to anon, authenticated;
grant execute on function public.marin_complete_module(text, text) to anon, authenticated;
grant execute on function public.marin_dev_dashboard(text) to anon, authenticated;
grant execute on function public.marin_dev_create_user(text, text, text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.marin_dev_set_user_role(text, uuid, text, text) to anon, authenticated;
grant execute on function public.marin_dev_update_user_full(text, uuid, text, text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.marin_dev_create_class(text, text, text, uuid, text, integer, text) to anon, authenticated;
grant execute on function public.marin_dev_update_class(text, uuid, text, text, uuid, boolean, text, integer, text) to anon, authenticated;
grant execute on function public.marin_dev_delete_class(text, uuid) to anon, authenticated;
grant execute on function public.marin_dev_set_class_enrollments(text, uuid, uuid[]) to anon, authenticated;
grant execute on function public.marin_teacher_dashboard(text) to anon, authenticated;
grant execute on function public.marin_teacher_create_class(text, text, text, text, integer, text, text) to anon, authenticated;
grant execute on function public.marin_teacher_update_class(text, uuid, text, text, text, integer, text, text) to anon, authenticated;
grant execute on function public.marin_teacher_delete_class(text, uuid) to anon, authenticated;
grant execute on function public.marin_teacher_set_student_access(text, uuid, uuid, text) to anon, authenticated;
grant execute on function public.marin_student_classes_dashboard(text) to anon, authenticated;
grant execute on function public.marin_student_request_access(text, uuid, text) to anon, authenticated;
grant execute on function public.marin_student_cancel_request(text, uuid) to anon, authenticated;

-- 9. Create or Promote your Developer account directly in profiles (example):
-- Option A (after signing up in the app):
-- update public.profiles
-- set role = 'developer', request_status = 'approved'
-- where email = 'abdouayazt@gmail.com';
--
-- Option B (create Developer directly in SQL Editor with password):
-- insert into public.profiles (email, username, password, password_hash, full_name, title, role, requested_role, request_status)
-- values ('abdouayazt@gmail.com', 'developer', 'ChangeMe123!', extensions.crypt('ChangeMe123!', extensions.gen_salt('bf', 10)), 'MARIN Developer', 'Développeur Plateforme', 'developer', 'developer', 'approved')
-- on conflict (lower(email)) do update set role = 'developer', request_status = 'approved', password = excluded.password, password_hash = excluded.password_hash;
