create extension if not exists pgcrypto;

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = uid
      and is_admin = true
  );
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text not null default '',
  department text not null default '',
  role text not null default '',
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.availability_defaults (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  enabled boolean not null default false,
  start_minute integer not null default 1080,
  end_minute integer not null default 1260,
  preference text not null default 'available'
    check (preference in ('available', 'maybe', 'unavailable')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, weekday)
);

create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  timezone text not null default 'America/Los_Angeles',
  status text not null default 'open'
    check (status in ('draft', 'open', 'closed')),
  required_people text[] not null default '{}',
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.poll_slots (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  slot_start timestamptz not null,
  slot_end timestamptz not null,
  label text not null default '',
  location text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  notes text not null default '',
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(poll_id, user_id)
);

create table if not exists public.response_slots (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references public.responses(id) on delete cascade,
  slot_id uuid not null references public.poll_slots(id) on delete cascade,
  preference text not null
    check (preference in ('available', 'maybe', 'unavailable')),
  created_at timestamptz not null default now(),
  unique(response_id, slot_id)
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_profiles_updated_at on public.profiles;
create trigger touch_profiles_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists touch_defaults_updated_at on public.availability_defaults;
create trigger touch_defaults_updated_at
before update on public.availability_defaults
for each row execute function public.touch_updated_at();

drop trigger if exists touch_polls_updated_at on public.polls;
create trigger touch_polls_updated_at
before update on public.polls
for each row execute function public.touch_updated_at();

drop trigger if exists touch_responses_updated_at on public.responses;
create trigger touch_responses_updated_at
before update on public.responses
for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.prevent_profile_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if old.id <> auth.uid() and not public.is_admin(auth.uid()) then
    raise exception 'You cannot edit another user profile';
  end if;

  if old.is_admin is distinct from new.is_admin and not public.is_admin(auth.uid()) then
    raise exception 'You cannot change admin status';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profiles_before_update on public.profiles;
create trigger protect_profiles_before_update
before update on public.profiles
for each row execute function public.prevent_profile_privilege_escalation();

alter table public.profiles enable row level security;
alter table public.availability_defaults enable row level security;
alter table public.polls enable row level security;
alter table public.poll_slots enable row level security;
alter table public.responses enable row level security;
alter table public.response_slots enable row level security;

drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin"
on public.profiles
for update
to authenticated
using (auth.uid() = id or public.is_admin(auth.uid()))
with check (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists "defaults_select_own" on public.availability_defaults;
create policy "defaults_select_own"
on public.availability_defaults
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "defaults_insert_own" on public.availability_defaults;
create policy "defaults_insert_own"
on public.availability_defaults
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "defaults_update_own" on public.availability_defaults;
create policy "defaults_update_own"
on public.availability_defaults
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "defaults_delete_own" on public.availability_defaults;
create policy "defaults_delete_own"
on public.availability_defaults
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "polls_select_authenticated" on public.polls;
create policy "polls_select_authenticated"
on public.polls
for select
to authenticated
using (true);

drop policy if exists "polls_insert_admin_only" on public.polls;
create policy "polls_insert_admin_only"
on public.polls
for insert
to authenticated
with check (public.is_admin(auth.uid()));

drop policy if exists "polls_update_admin_only" on public.polls;
create policy "polls_update_admin_only"
on public.polls
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "polls_delete_admin_only" on public.polls;
create policy "polls_delete_admin_only"
on public.polls
for delete
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "poll_slots_select_authenticated" on public.poll_slots;
create policy "poll_slots_select_authenticated"
on public.poll_slots
for select
to authenticated
using (true);

drop policy if exists "poll_slots_insert_admin_only" on public.poll_slots;
create policy "poll_slots_insert_admin_only"
on public.poll_slots
for insert
to authenticated
with check (public.is_admin(auth.uid()));

drop policy if exists "poll_slots_update_admin_only" on public.poll_slots;
create policy "poll_slots_update_admin_only"
on public.poll_slots
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "poll_slots_delete_admin_only" on public.poll_slots;
create policy "poll_slots_delete_admin_only"
on public.poll_slots
for delete
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "responses_select_authenticated" on public.responses;
create policy "responses_select_authenticated"
on public.responses
for select
to authenticated
using (true);

drop policy if exists "responses_insert_own" on public.responses;
create policy "responses_insert_own"
on public.responses
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "responses_update_own_or_admin" on public.responses;
create policy "responses_update_own_or_admin"
on public.responses
for update
to authenticated
using (auth.uid() = user_id or public.is_admin(auth.uid()))
with check (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "responses_delete_own_or_admin" on public.responses;
create policy "responses_delete_own_or_admin"
on public.responses
for delete
to authenticated
using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "response_slots_select_authenticated" on public.response_slots;
create policy "response_slots_select_authenticated"
on public.response_slots
for select
to authenticated
using (true);

drop policy if exists "response_slots_insert_own_or_admin" on public.response_slots;
create policy "response_slots_insert_own_or_admin"
on public.response_slots
for insert
to authenticated
with check (
  exists (
    select 1
    from public.responses r
    where r.id = response_id
      and (r.user_id = auth.uid() or public.is_admin(auth.uid()))
  )
);

drop policy if exists "response_slots_update_own_or_admin" on public.response_slots;
create policy "response_slots_update_own_or_admin"
on public.response_slots
for update
to authenticated
using (
  exists (
    select 1
    from public.responses r
    where r.id = response_id
      and (r.user_id = auth.uid() or public.is_admin(auth.uid()))
  )
)
with check (
  exists (
    select 1
    from public.responses r
    where r.id = response_id
      and (r.user_id = auth.uid() or public.is_admin(auth.uid()))
  )
);

drop policy if exists "response_slots_delete_own_or_admin" on public.response_slots;
create policy "response_slots_delete_own_or_admin"
on public.response_slots
for delete
to authenticated
using (
  exists (
    select 1
    from public.responses r
    where r.id = response_id
      and (r.user_id = auth.uid() or public.is_admin(auth.uid()))
  )
);

insert into public.availability_defaults (user_id, weekday, enabled, start_minute, end_minute, preference)
select p.id, d.weekday, false, 1080, 1260, 'available'
from public.profiles p
cross join (
  values (0),(1),(2),(3),(4),(5),(6)
) as d(weekday)
on conflict (user_id, weekday) do nothing;
