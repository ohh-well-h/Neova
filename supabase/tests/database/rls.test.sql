begin;

create extension if not exists pgtap with schema extensions;
select plan(15);

insert into auth.users (id, email, raw_user_meta_data)
values
  ('11111111-1111-1111-1111-111111111111', 'one@example.test', '{}'),
  ('22222222-2222-2222-2222-222222222222', 'two@example.test', '{}'),
  ('33333333-3333-3333-3333-333333333333', 'three@example.test', '{}');

insert into public.users (id, email, postpartum_start_date, display_name)
values
  ('11111111-1111-1111-1111-111111111111', 'one@example.test', '2026-07-14', 'One'),
  ('22222222-2222-2222-2222-222222222222', 'two@example.test', '2026-07-21', 'Two'),
  ('33333333-3333-3333-3333-333333333333', 'three@example.test', '2026-07-28', 'Three');

insert into public.cohorts (id, name, stage_window_start, stage_window_end)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'The Test Circle', 6, 10),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'The Other Circle', 6, 10);

insert into public.cohort_members (user_id, cohort_id)
values
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

insert into public.posts (id, cohort_id, author_id, body, is_anonymous)
values
  ('aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Circle A post', true),
  ('bbbbbbbb-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 'Circle B post', false);

set local role authenticated;
set local "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';

select results_eq(
  'select count(*) from public.users',
  array[1::bigint],
  'a member can read only their own full intake profile'
);

select results_eq(
  $$select count(*) from public.get_cohort_posts('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')$$,
  array[1::bigint],
  'the scoped feed RPC returns only the requested member cohort'
);

select results_eq(
  $$select count(*) from public.get_cohort_posts('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') where author_id is null and author_name = 'Anonymous'$$,
  array[1::bigint],
  'anonymous author identity is redacted on the server'
);

select results_eq(
  $$select count(*) from public.get_circle_members('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')$$,
  array[2::bigint],
  'the scoped roster RPC returns same-cohort members'
);

select lives_ok(
  $$insert into public.reactions (post_id, user_id, type) values ('aaaaaaaa-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'same')$$,
  'a member can react inside their cohort'
);

select results_eq(
  $$select count(*) from public.get_my_cohort_reactions('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')$$,
  array[1::bigint],
  'the reaction RPC returns only the caller reaction state'
);

select lives_ok(
  $$insert into public.flags (post_id, flagged_by, reason) values ('aaaaaaaa-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Reviewed test marker')$$,
  'a member can submit an insert-only moderator flag'
);

select throws_ok(
  $$select count(*) from public.flags$$,
  '42501',
  null,
  'clients cannot read the private moderation queue'
);

select throws_ok(
  $$select count(*) from public.posts$$,
  '42501',
  null,
  'clients cannot query raw post author fields'
);

select throws_ok(
  $$select count(*) from public.reactions$$,
  '42501',
  null,
  'clients cannot query cohort reaction identities or counts'
);

select lives_ok(
  $$insert into public.flags (post_id, flagged_by, reason) values ('aaaaaaaa-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Automatic crisis-language marker match')$$,
  'a server-created crisis marker flag can remain pending'
);

select results_eq(
  $$select public.needs_safety_acknowledgement()$$,
  array[true],
  'pending crisis resources survive as server-backed state'
);

select lives_ok(
  $$select public.acknowledge_safety_resources()$$,
  'the member can explicitly acknowledge safety resources'
);

select results_eq(
  $$select public.needs_safety_acknowledgement()$$,
  array[false],
  'only explicit acknowledgement resolves the server-backed pending state'
);

set local "request.jwt.claim.sub" = '33333333-3333-3333-3333-333333333333';

select throws_ok(
  $$select * from public.get_cohort_posts('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')$$,
  '42501',
  null,
  'a non-member cannot call another cohort feed RPC'
);

set local role anon;
reset "request.jwt.claim.sub";

select * from finish();
rollback;
