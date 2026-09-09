export type BirthExperience =
  | 'vaginal'
  | 'c-section'
  | 'nicu'
  | 'loss'
  | 'multiples';

export type SupportPreference = 'venting' | 'advice' | 'company';

export type ReactionType = 'sending_strength' | 'same' | 'here_for_you';

export type AppUser = {
  id: string;
  email: string;
};

export type Profile = {
  id: string;
  email: string;
  displayName: string;
  postpartumStartDate: string;
  isAnonymous: boolean;
  birthExperiences: BirthExperience[];
  supportPreferences: SupportPreference[];
  createdAt: string;
};

export type Cohort = {
  id: string;
  name: string;
  stageWindowStart: number;
  stageWindowEnd: number;
  createdAt: string;
};

export type CircleMember = {
  userId: string;
  displayName: string;
  joinedAt: string;
};

export type CohortPost = {
  id: string;
  cohortId: string;
  authorId: string | null;
  authorName: string;
  body: string;
  isAnonymous: boolean;
  flagged: boolean;
  createdAt: string;
  myReactions: ReactionType[];
};

export type IntakeInput = {
  displayName: string;
  weeksPostpartum: number;
  birthExperiences: BirthExperience[];
  supportPreferences: SupportPreference[];
};

export type NewPostInput = {
  body: string;
  isAnonymous: boolean;
};

export type ConcernInput = {
  subjectUserId?: string;
  reason: string;
};

export type Article = {
  slug: string;
  title: string;
  subtitle: string;
  minutes: number;
  stageStart: number;
  stageEnd: number;
  paragraphs: string[];
  sourceLabel: string;
  sourceUrl: string;
};

export type ImpactFocus = {
  id: string;
  title: string;
  description: string;
};
