import type { RealtimeChannel, User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type {
  CircleMember,
  Cohort,
  CohortPost,
  ConcernInput,
  IntakeInput,
  Profile,
  ReactionType,
} from '@/types/models';

const requireClient = () => {
  if (!supabase) {
    throw new Error('Supabase is not configured. Use demo mode or add environment variables.');
  }
  return supabase;
};

const mapProfile = (row: {
  id: string;
  email: string;
  display_name: string;
  postpartum_start_date: string;
  is_anonymous: boolean;
  birth_experiences: Profile['birthExperiences'];
  support_preferences: Profile['supportPreferences'];
  created_at: string;
}): Profile => ({
  id: row.id,
  email: row.email,
  displayName: row.display_name,
  postpartumStartDate: row.postpartum_start_date,
  isAnonymous: row.is_anonymous,
  birthExperiences: row.birth_experiences ?? [],
  supportPreferences: row.support_preferences ?? [],
  createdAt: row.created_at,
});

export async function getProfile(userId: string): Promise<Profile | null> {
  const client = requireClient();
  const { data, error } = await client.from('users').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data ? mapProfile(data) : null;
}

export async function completeSupabaseIntake(user: User, input: IntakeInput): Promise<void> {
  const client = requireClient();
  const postpartumStartDate = new Date();
  postpartumStartDate.setDate(postpartumStartDate.getDate() - input.weeksPostpartum * 7);

  const { error: profileError } = await client.from('users').upsert({
    id: user.id,
    email: user.email ?? '',
    display_name: input.displayName.trim(),
    postpartum_start_date: postpartumStartDate.toISOString().slice(0, 10),
    is_anonymous: false,
    birth_experiences: input.birthExperiences,
    support_preferences: input.supportPreferences,
  });
  if (profileError) throw profileError;

  const { error: cohortError } = await client.rpc('assign_user_to_cohort', {
    p_user_id: user.id,
    p_postpartum_week: input.weeksPostpartum,
  });
  if (cohortError) throw cohortError;
}

export async function getCurrentCohort(userId: string): Promise<Cohort | null> {
  const client = requireClient();
  const { data: membership, error: membershipError } = await client
    .from('cohort_members')
    .select('cohort_id')
    .eq('user_id', userId)
    .maybeSingle();
  if (membershipError) throw membershipError;
  if (!membership) return null;

  const { data, error } = await client
    .from('cohorts')
    .select('*')
    .eq('id', membership.cohort_id)
    .single();
  if (error) throw error;
  return {
    id: data.id,
    name: data.name,
    stageWindowStart: data.stage_window_start,
    stageWindowEnd: data.stage_window_end,
    createdAt: data.created_at,
  };
}

export async function getCircleMembers(cohortId: string): Promise<CircleMember[]> {
  const client = requireClient();
  const { data: memberships, error } = await client.rpc('get_circle_members', {
    p_cohort_id: cohortId,
  });
  if (error) throw error;
  return (memberships ?? []).map((membership) => ({
    userId: membership.user_id,
    displayName: membership.display_name,
    joinedAt: membership.joined_at,
  }));
}

export async function getPosts(cohortId: string): Promise<CohortPost[]> {
  const client = requireClient();
  const { data: posts, error } = await client.rpc('get_cohort_posts', {
    p_cohort_id: cohortId,
    p_limit: 50,
  });
  if (error) throw error;

  const { data: reactions, error: reactionsError } = await client.rpc(
    'get_my_cohort_reactions',
    { p_cohort_id: cohortId },
  );
  if (reactionsError) throw reactionsError;

  return (posts ?? []).map((post) => ({
    id: post.id,
    cohortId: post.cohort_id,
    authorId: post.author_id,
    authorName: post.author_name,
    body: post.body,
    isAnonymous: post.is_anonymous,
    flagged: post.flagged,
    createdAt: post.created_at,
    myReactions: (reactions ?? [])
      .filter((reaction) => reaction.post_id === post.id)
      .map((reaction) => reaction.type as ReactionType),
  }));
}

export async function insertPost(
  cohortId: string,
  body: string,
  isAnonymous: boolean,
): Promise<boolean> {
  const client = requireClient();
  const { data, error } = await client.rpc('create_cohort_post', {
    p_cohort_id: cohortId,
    p_body: body,
    p_is_anonymous: isAnonymous,
  });
  if (error) throw error;
  const result = data?.[0];
  if (!result) throw new Error('The post could not be created.');
  return result.needs_acknowledgement;
}

export async function getNeedsSafetyAcknowledgement(): Promise<boolean> {
  const client = requireClient();
  const { data, error } = await client.rpc('needs_safety_acknowledgement', {});
  if (error) throw error;
  return data;
}

export async function acknowledgeSafetyResources(): Promise<void> {
  const client = requireClient();
  const { error } = await client.rpc('acknowledge_safety_resources', {});
  if (error) throw error;
}

export async function toggleSupabaseReaction(
  postId: string,
  userId: string,
  type: ReactionType,
  active: boolean,
): Promise<void> {
  const client = requireClient();
  if (active) {
    const { error } = await client.from('reactions').delete().match({ post_id: postId, user_id: userId, type });
    if (error) throw error;
  } else {
    const { error } = await client.from('reactions').upsert({ post_id: postId, user_id: userId, type });
    if (error) throw error;
  }
}

export async function insertFlag(
  flaggedBy: string,
  reason: string,
  options: { postId?: string; subjectUserId?: string } = {},
): Promise<void> {
  const client = requireClient();
  const { error } = await client.from('flags').insert({
    flagged_by: flaggedBy,
    post_id: options.postId ?? null,
    subject_user_id: options.subjectUserId ?? null,
    reason,
  });
  if (error) throw error;
}

export async function updateSupabaseAnonymousMode(userId: string, value: boolean): Promise<void> {
  const client = requireClient();
  const { error } = await client.from('users').update({ is_anonymous: value }).eq('id', userId);
  if (error) throw error;
}

export async function insertConcern(flaggedBy: string, concern: ConcernInput): Promise<void> {
  return insertFlag(flaggedBy, concern.reason, { subjectUserId: concern.subjectUserId });
}

export function subscribeToCohortPosts(cohortId: string, onChange: () => void): RealtimeChannel {
  const client = requireClient();
  return client
    .channel(`cohort-events:${cohortId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'cohort_events', filter: `cohort_id=eq.${cohortId}` },
      onChange,
    )
    .subscribe();
}
