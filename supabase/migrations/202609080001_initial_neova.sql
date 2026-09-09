-- Neova v1 schema, cohort assignment, and row-level security.
-- Apply with `supabase db push` or paste into the Supabase SQL editor.

create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  postpartum_start_date date not null,
  display_name text not null check (char_length(display_name) between 1 and 80),
  is_anonymous boolean not null default false,
  birth_experiences text[] not null default '{}',
  support_preferences text[] not null default '{}',
  created_at timestamptz not null default now(),
  constraint users_birth_experiences_valid check (
    birth_experiences <@ array['vaginal', 'c-section', 'nicu', 'loss', 'multiples']::text[]
  ),
  constraint users_support_preferences_valid check (
    support_preferences <@ array['venting', 'advice', 'company']::text[]
  )
);

create table if not exists public.cohorts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  stage_window_start integer not null check (stage_window_start >= 0),
  stage_window_end integer not null check (stage_window_end >= stage_window_start),
  created_at timestamptz not null default now()
);

create table if not exists public.cohort_members (
  user_id uuid primary key references public.users(id) on delete cascade,
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  joined_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  author_id uuid not null references public.users(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 4000),
  is_anonymous boolean not null default false,
  flagged boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null check (type in ('sending_strength', 'same', 'here_for_you')),
  created_at timestamptz not null default now(),
  unique (post_id, user_id, type)
);

create table if not exists public.flags (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  subject_user_id uuid references public.users(id) on delete cascade,
  flagged_by uuid not null references public.users(id) on delete cascade,
  reason text not null check (char_length(btrim(reason)) between 1 and 1000),
  resolved boolean not null default false,
  acknowledged_at timestamptz,
  created_at timestamptz not null default now(),
  constraint flags_exactly_one_subject check (num_nonnulls(post_id, subject_user_id) = 1)
);

create table if not exists private.crisis_language_markers (
  marker text primary key check (char_length(btrim(marker)) > 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.cohort_events (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists cohort_members_cohort_id_idx on public.cohort_members(cohort_id);
create index if not exists posts_cohort_created_at_idx on public.posts(cohort_id, created_at desc);
create index if not exists reactions_post_id_idx on public.reactions(post_id);
create index if not exists flags_unresolved_created_at_idx on public.flags(resolved, created_at desc);
create index if not exists cohort_events_cohort_created_at_idx on public.cohort_events(cohort_id, created_at desc);

alter table public.users enable row level security;
alter table public.cohorts enable row level security;
alter table public.cohort_members enable row level security;
alter table public.posts enable row level security;
alter table public.reactions enable row level security;
alter table public.flags enable row level security;
alter table public.cohort_events enable row level security;

create or replace function private.is_cohort_member(p_cohort_id uuid, p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.cohort_members
    where cohort_id = p_cohort_id and user_id = p_user_id
  );
$$;

create or replace function private.users_share_cohort(p_first_user_id uuid, p_second_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.cohort_members first_member
    join public.cohort_members second_member using (cohort_id)
    where first_member.user_id = p_first_user_id
      and second_member.user_id = p_second_user_id
  );
$$;

create or replace function private.is_post_cohort_member(p_post_id uuid, p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.posts p
    join public.cohort_members cm on cm.cohort_id = p.cohort_id
    where p.id = p_post_id and cm.user_id = p_user_id
  );
$$;

create or replace function public.assign_user_to_cohort(p_user_id uuid, p_postpartum_week integer)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_start integer;
  v_end integer;
  v_cohort_id uuid;
  v_cohort_count integer;
  v_names text[] := array['Juniper', 'Willow', 'Cedar', 'Meadow', 'Linden', 'Fern'];
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'A user may only assign their own cohort' using errcode = '42501';
  end if;

  if not exists (select 1 from public.users where id = p_user_id) then
    raise exception 'Complete intake before cohort assignment' using errcode = '23503';
  end if;

  select cohort_id into v_cohort_id
  from public.cohort_members
  where user_id = p_user_id;
  if v_cohort_id is not null then
    return v_cohort_id;
  end if;

  p_postpartum_week := greatest(0, coalesce(p_postpartum_week, 0));
  select stage_start, stage_end into v_start, v_end
  from (values
    (0, 5), (6, 10), (11, 16), (17, 24), (25, 36), (37, 52), (53, 104)
  ) as windows(stage_start, stage_end)
  where p_postpartum_week <= stage_end
  order by stage_end
  limit 1;
  if v_start is null then
    v_start := 53;
    v_end := 104;
  end if;

  perform pg_advisory_xact_lock(hashtextextended('neova-cohort-' || v_start::text, 0));

  select c.id into v_cohort_id
  from public.cohorts c
  where c.stage_window_start = v_start
    and c.stage_window_end = v_end
    and (select count(*) from public.cohort_members cm where cm.cohort_id = c.id) < 15
  order by c.created_at
  limit 1
  for update skip locked;

  if v_cohort_id is null then
    select count(*)::integer into v_cohort_count
    from public.cohorts
    where stage_window_start = v_start and stage_window_end = v_end;

    insert into public.cohorts (name, stage_window_start, stage_window_end)
    values (
      'The ' || v_names[(v_cohort_count % array_length(v_names, 1)) + 1] || ' Circle',
      v_start,
      v_end
    )
    returning id into v_cohort_id;
  end if;

  insert into public.cohort_members (user_id, cohort_id)
  values (p_user_id, v_cohort_id);
  return v_cohort_id;
end;
$$;

create or replace function public.get_circle_members(p_cohort_id uuid)
returns table (
  user_id uuid,
  display_name text,
  joined_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_cohort_member(p_cohort_id, auth.uid()) then
    raise exception 'Not a member of this cohort' using errcode = '42501';
  end if;

  return query
  select u.id, u.display_name, cm.joined_at
  from public.cohort_members cm
  join public.users u on u.id = cm.user_id
  where cm.cohort_id = p_cohort_id
  order by cm.joined_at;
end;
$$;

create or replace function public.get_cohort_posts(p_cohort_id uuid, p_limit integer default 50)
returns table (
  id uuid,
  cohort_id uuid,
  author_id uuid,
  author_name text,
  body text,
  is_anonymous boolean,
  flagged boolean,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_cohort_member(p_cohort_id, auth.uid()) then
    raise exception 'Not a member of this cohort' using errcode = '42501';
  end if;

  return query
  select p.id, p.cohort_id,
    case when p.is_anonymous then null else p.author_id end,
    case when p.is_anonymous then 'Anonymous' else u.display_name end,
    p.body,
    p.is_anonymous, p.flagged, p.created_at
  from public.posts p
  join public.users u on u.id = p.author_id
  where p.cohort_id = p_cohort_id
  order by p.created_at desc
  limit least(greatest(coalesce(p_limit, 50), 1), 50);
end;
$$;

create or replace function public.create_cohort_post(
  p_cohort_id uuid,
  p_body text,
  p_is_anonymous boolean
)
returns table (post_id uuid, needs_acknowledgement boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_needs_safety_review boolean;
begin
  if auth.uid() is null or not private.is_cohort_member(p_cohort_id, auth.uid()) then
    raise exception 'Not a member of this cohort' using errcode = '42501';
  end if;
  if char_length(btrim(p_body)) not between 1 and 4000 then
    raise exception 'Post body must be between 1 and 4000 characters' using errcode = '22023';
  end if;

  select exists (
    select 1
    from private.crisis_language_markers m
    where m.active
      and position(
        lower(regexp_replace(btrim(m.marker), '\s+', ' ', 'g'))
        in lower(regexp_replace(btrim(p_body), '\s+', ' ', 'g'))
      ) > 0
  ) into v_needs_safety_review;

  insert into public.posts (cohort_id, author_id, body, is_anonymous)
  values (p_cohort_id, auth.uid(), p_body, coalesce(p_is_anonymous, false))
  returning id into post_id;

  if v_needs_safety_review then
    insert into public.flags (post_id, flagged_by, reason)
    values (post_id, auth.uid(), 'Automatic crisis-language marker match');
  end if;

  needs_acknowledgement := v_needs_safety_review;
  return next;
end;
$$;

create or replace function public.get_my_cohort_reactions(p_cohort_id uuid)
returns table (post_id uuid, type text)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_cohort_member(p_cohort_id, auth.uid()) then
    raise exception 'Not a member of this cohort' using errcode = '42501';
  end if;

  return query
  select r.post_id, r.type
  from public.reactions r
  join public.posts p on p.id = r.post_id
  where p.cohort_id = p_cohort_id and r.user_id = auth.uid();
end;
$$;

create or replace function public.needs_safety_acknowledgement()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null and exists (
    select 1 from public.flags
    where flagged_by = auth.uid()
      and reason = 'Automatic crisis-language marker match'
      and acknowledged_at is null
  );
$$;

create or replace function public.acknowledge_safety_resources()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  update public.flags
  set acknowledged_at = now()
  where flagged_by = auth.uid()
    and reason = 'Automatic crisis-language marker match'
    and acknowledged_at is null;
end;
$$;

create or replace function private.emit_post_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.cohort_events (cohort_id) values (coalesce(new.cohort_id, old.cohort_id));
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

create or replace function private.emit_reaction_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cohort_id uuid;
begin
  select cohort_id into v_cohort_id
  from public.posts
  where id = coalesce(new.post_id, old.post_id);
  if v_cohort_id is not null then
    insert into public.cohort_events (cohort_id) values (v_cohort_id);
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists posts_emit_cohort_event on public.posts;
create trigger posts_emit_cohort_event
after insert or update on public.posts
for each row execute function private.emit_post_event();

drop trigger if exists reactions_emit_cohort_event on public.reactions;
create trigger reactions_emit_cohort_event
after insert or delete on public.reactions
for each row execute function private.emit_reaction_event();

drop policy if exists "users_select_own" on public.users;
create policy "users_select_own" on public.users for select to authenticated using (id = (select auth.uid()));
drop policy if exists "users_insert_own" on public.users;
create policy "users_insert_own" on public.users for insert to authenticated with check (id = (select auth.uid()));
drop policy if exists "users_update_own" on public.users;
create policy "users_update_own" on public.users for update to authenticated
using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists "cohorts_select_member" on public.cohorts;
create policy "cohorts_select_member" on public.cohorts for select to authenticated
using (private.is_cohort_member(id));

drop policy if exists "members_select_same_cohort" on public.cohort_members;
create policy "members_select_same_cohort" on public.cohort_members for select to authenticated
using (user_id = (select auth.uid()) or private.is_cohort_member(cohort_id));

drop policy if exists "posts_select_same_cohort" on public.posts;
create policy "posts_select_same_cohort" on public.posts for select to authenticated
using (private.is_cohort_member(cohort_id));
drop policy if exists "posts_insert_own" on public.posts;
create policy "posts_insert_own" on public.posts for insert to authenticated
with check (author_id = (select auth.uid()) and flagged = false and private.is_cohort_member(cohort_id));

drop policy if exists "reactions_select_same_cohort" on public.reactions;
create policy "reactions_select_same_cohort" on public.reactions for select to authenticated
using (private.is_post_cohort_member(post_id));
drop policy if exists "reactions_insert_own" on public.reactions;
create policy "reactions_insert_own" on public.reactions for insert to authenticated
with check (user_id = (select auth.uid()) and private.is_post_cohort_member(post_id));
drop policy if exists "reactions_delete_own" on public.reactions;
create policy "reactions_delete_own" on public.reactions for delete to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "flags_insert_private" on public.flags;
create policy "flags_insert_private" on public.flags for insert to authenticated
with check (
  flagged_by = (select auth.uid())
  and (
    (post_id is not null and private.is_post_cohort_member(post_id))
    or
    (subject_user_id is not null and private.users_share_cohort((select auth.uid()), subject_user_id))
  )
);

drop policy if exists "cohort_events_select_member" on public.cohort_events;
create policy "cohort_events_select_member" on public.cohort_events for select to authenticated
using (private.is_cohort_member(cohort_id));

revoke all on public.users, public.cohorts, public.cohort_members, public.posts, public.reactions, public.flags, public.cohort_events from anon, authenticated;
grant select, insert, update on public.users to authenticated;
grant select on public.cohorts, public.cohort_members to authenticated;
grant insert, delete on public.reactions to authenticated;
grant insert on public.flags to authenticated;
grant select on public.cohort_events to authenticated;

revoke all on function public.assign_user_to_cohort(uuid, integer) from public, anon;
revoke all on function public.get_circle_members(uuid) from public, anon;
revoke all on function public.get_cohort_posts(uuid, integer) from public, anon;
revoke all on function public.create_cohort_post(uuid, text, boolean) from public, anon;
revoke all on function public.get_my_cohort_reactions(uuid) from public, anon;
revoke all on function public.needs_safety_acknowledgement() from public, anon;
revoke all on function public.acknowledge_safety_resources() from public, anon;
revoke all on function private.is_cohort_member(uuid, uuid) from public, anon;
revoke all on function private.users_share_cohort(uuid, uuid) from public, anon;
revoke all on function private.is_post_cohort_member(uuid, uuid) from public, anon;
grant execute on function public.assign_user_to_cohort(uuid, integer) to authenticated;
grant execute on function public.get_circle_members(uuid) to authenticated;
grant execute on function public.get_cohort_posts(uuid, integer) to authenticated;
grant execute on function public.create_cohort_post(uuid, text, boolean) to authenticated;
grant execute on function public.get_my_cohort_reactions(uuid) to authenticated;
grant execute on function public.needs_safety_acknowledgement() to authenticated;
grant execute on function public.acknowledge_safety_resources() to authenticated;
grant execute on function private.is_cohort_member(uuid, uuid) to authenticated;
grant execute on function private.users_share_cohort(uuid, uuid) to authenticated;
grant execute on function private.is_post_cohort_member(uuid, uuid) to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'cohort_events'
  ) then
    alter publication supabase_realtime add table public.cohort_events;
  end if;
end $$;
