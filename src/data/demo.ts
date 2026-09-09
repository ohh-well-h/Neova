import type { CircleMember, Cohort, CohortPost, Profile } from '@/types/models';
import { postpartumStartDateForWeeks } from '@/services/cohortMatching';

const isoMinutesAgo = (minutes: number, now: Date) =>
  new Date(now.getTime() - minutes * 60 * 1000).toISOString();

export function createDemoData(now = new Date()) {
  const profile: Profile = {
    id: 'demo-user-maya',
    email: 'maya@example.com',
    displayName: 'Maya',
    postpartumStartDate: postpartumStartDateForWeeks(8, now),
    isAnonymous: false,
    birthExperiences: ['c-section'],
    supportPreferences: ['venting', 'company'],
    createdAt: isoMinutesAgo(60 * 24 * 14, now),
  };

  const cohort: Cohort = {
    id: 'demo-cohort-juniper',
    name: 'The Juniper Circle',
    stageWindowStart: 6,
    stageWindowEnd: 10,
    createdAt: isoMinutesAgo(60 * 24 * 21, now),
  };

  const names = ['Maya', 'Nora', 'Elise', 'Carmen', 'Aisha', 'Jo'];
  const members: CircleMember[] = names.map((displayName, index) => ({
    userId: index === 0 ? profile.id : `demo-member-${index}`,
    displayName,
    joinedAt: isoMinutesAgo(60 * 24 * (13 - index), now),
  }));

  const posts: CohortPost[] = [
    {
      id: 'demo-post-nora',
      cohortId: cohort.id,
      authorId: 'demo-member-1',
      authorName: 'Nora',
      body: 'First solo walk with the baby today. Five minutes, but I needed it.',
      isAnonymous: false,
      flagged: false,
      createdAt: isoMinutesAgo(12, now),
      myReactions: [],
    },
    {
      id: 'demo-post-anonymous',
      cohortId: cohort.id,
      authorId: 'demo-member-3',
      authorName: 'Carmen',
      body: 'Night feeds have felt endless. I’m trying to remember that making it to morning is enough.',
      isAnonymous: true,
      flagged: false,
      createdAt: isoMinutesAgo(38, now),
      myReactions: ['same'],
    },
  ];

  return { profile, cohort, members, posts };
}
