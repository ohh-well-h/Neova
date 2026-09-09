import type { User } from '@supabase/supabase-js';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { createDemoData } from '@/data/demo';
import { supabase } from '@/lib/supabase';
import { getStageWindow, postpartumStartDateForWeeks } from '@/services/cohortMatching';
import { containsCrisisLanguage } from '@/services/safety';
import {
  clearSafetyPending,
  getDemoSessionActive,
  getSafetyPending,
  setDemoSessionActive,
  setSafetyPending,
} from '@/services/safetyPending';
import {
  completeSupabaseIntake,
  acknowledgeSafetyResources as acknowledgeSupabaseSafetyResources,
  getCircleMembers,
  getCurrentCohort,
  getNeedsSafetyAcknowledgement,
  getPosts,
  getProfile,
  insertConcern,
  insertPost,
  subscribeToCohortPosts,
  toggleSupabaseReaction,
  updateSupabaseAnonymousMode,
} from '@/services/supabaseRepository';
import type {
  AppUser,
  CircleMember,
  Cohort,
  CohortPost,
  ConcernInput,
  IntakeInput,
  NewPostInput,
  Profile,
  ReactionType,
} from '@/types/models';

type SubmitPostResult = { crisisMatched: boolean };

type AppContextValue = {
  loading: boolean;
  refreshing: boolean;
  startupError: string | null;
  demoMode: boolean;
  user: AppUser | null;
  profile: Profile | null;
  cohort: Cohort | null;
  members: CircleMember[];
  posts: CohortPost[];
  hasCompletedIntake: boolean;
  requiresSafetyAcknowledgement: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ needsEmailConfirmation: boolean }>;
  enterDemo: () => Promise<void>;
  signOut: () => Promise<void>;
  completeIntake: (input: IntakeInput) => Promise<void>;
  submitPost: (input: NewPostInput) => Promise<SubmitPostResult>;
  toggleReaction: (postId: string, type: ReactionType) => Promise<void>;
  flagConcern: (input: ConcernInput) => Promise<void>;
  setAnonymousMode: (value: boolean) => Promise<void>;
  acknowledgeSafetyResources: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

const toAppUser = (user: User): AppUser => ({ id: user.id, email: user.email ?? '' });

export function AppProvider({ children }: React.PropsWithChildren) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [startupError, setStartupError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [posts, setPosts] = useState<CohortPost[]>([]);
  const [requiresSafetyAcknowledgement, setRequiresSafetyAcknowledgement] = useState(false);
  const demoModeRef = useRef(false);

  const hydrateForUser = useCallback(async (authUser: User) => {
    setStartupError(null);
    const localPending = await getSafetyPending(authUser.id);
    setUser(toAppUser(authUser));
    setRequiresSafetyAcknowledgement(localPending);
    const nextProfile = await getProfile(authUser.id);
    setProfile(nextProfile);
    if (!nextProfile) {
      setCohort(null);
      setMembers([]);
      setPosts([]);
      return;
    }

    const nextCohort = await getCurrentCohort(authUser.id);
    setCohort(nextCohort);
    if (!nextCohort) {
      setMembers([]);
      setPosts([]);
      return;
    }

    const [nextMembers, nextPosts, nextNeedsAcknowledgement] = await Promise.all([
      getCircleMembers(nextCohort.id),
      getPosts(nextCohort.id),
      getNeedsSafetyAcknowledgement(),
    ]);
    setMembers(nextMembers);
    setPosts(nextPosts);
    if (nextNeedsAcknowledgement) {
      setRequiresSafetyAcknowledgement(true);
      await setSafetyPending(authUser.id);
    }
    setRequiresSafetyAcknowledgement(localPending || nextNeedsAcknowledgement);
  }, []);

  useEffect(() => {
    let mounted = true;
    let authSubscription: { unsubscribe: () => void } | null = null;

    const restoreDemo = async () => {
      const demo = createDemoData();
      const pending = await getSafetyPending(demo.profile.id);
      demoModeRef.current = true;
      setDemoMode(true);
      setUser({ id: demo.profile.id, email: demo.profile.email });
      setProfile(demo.profile);
      setCohort(demo.cohort);
      setMembers(demo.members);
      setPosts(demo.posts);
      setRequiresSafetyAcknowledgement(pending);
      setStartupError(null);
    };

    const bootstrap = async () => {
      try {
        const restoreDemoSession = await getDemoSessionActive();
        if (restoreDemoSession) await restoreDemo();

        if (supabase) {
          const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!mounted || demoModeRef.current) return;
            if (!session?.user) {
              setUser(null);
              setProfile(null);
              setCohort(null);
              setMembers([]);
              setPosts([]);
              setRequiresSafetyAcknowledgement(false);
              setStartupError(null);
              setLoading(false);
              return;
            }
            setLoading(true);
            setTimeout(() => {
              void hydrateForUser(session.user)
                .catch((error: unknown) => {
                  if (mounted) setStartupError(error instanceof Error ? error.message : 'Could not load your circle.');
                })
                .finally(() => {
                  if (mounted) setLoading(false);
                });
            }, 0);
          });
          authSubscription = authListener.subscription;
        }

        if (restoreDemoSession || !supabase) return;
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) await hydrateForUser(data.session.user);
      } catch (error) {
        if (mounted) setStartupError(error instanceof Error ? error.message : 'Could not load your circle.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void bootstrap();

    return () => {
      mounted = false;
      authSubscription?.unsubscribe();
    };
  }, [hydrateForUser]);

  const refresh = useCallback(async () => {
    if (demoMode || !supabase) return;
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    setLoading(true);
    setRefreshing(true);
    try {
      await hydrateForUser(data.user);
    } catch (error) {
      setStartupError(error instanceof Error ? error.message : 'Could not refresh your circle.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [demoMode, hydrateForUser]);

  useEffect(() => {
    if (!supabase || demoMode || !cohort || !user) return;
    const client = supabase;
    const channel = subscribeToCohortPosts(cohort.id, () => {
      void getPosts(cohort.id).then(setPosts).catch(() => {
        setStartupError('The latest circle updates could not be loaded. Pull to refresh.');
      });
    });
    return () => {
      void client.removeChannel(channel);
    };
  }, [cohort, demoMode, user]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase is not configured. Choose Explore demo instead.');
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase is not configured. Choose Explore demo instead.');
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
    if (error) throw error;
    return { needsEmailConfirmation: !data.session };
  }, []);

  const enterDemo = useCallback(async () => {
    const demo = createDemoData();
    await setDemoSessionActive(true);
    const pending = await getSafetyPending(demo.profile.id);
    demoModeRef.current = true;
    setDemoMode(true);
    setUser({ id: demo.profile.id, email: demo.profile.email });
    setProfile(demo.profile);
    setCohort(demo.cohort);
    setMembers(demo.members);
    setPosts(demo.posts);
    setRequiresSafetyAcknowledgement(pending);
    setStartupError(null);
  }, []);

  const signOut = useCallback(async () => {
    if (supabase && !demoMode) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
    if (demoMode) await setDemoSessionActive(false);
    demoModeRef.current = false;
    setDemoMode(false);
    setUser(null);
    setProfile(null);
    setCohort(null);
    setMembers([]);
    setPosts([]);
    setRequiresSafetyAcknowledgement(false);
    setStartupError(null);
  }, [demoMode]);

  const completeIntake = useCallback(
    async (input: IntakeInput) => {
      if (!user) throw new Error('Sign in before completing intake.');
      if (demoMode) {
        const window = getStageWindow(input.weeksPostpartum);
        const nextProfile: Profile = {
          id: user.id,
          email: user.email,
          displayName: input.displayName.trim(),
          postpartumStartDate: postpartumStartDateForWeeks(input.weeksPostpartum),
          isAnonymous: false,
          birthExperiences: input.birthExperiences,
          supportPreferences: input.supportPreferences,
          createdAt: new Date().toISOString(),
        };
        setProfile(nextProfile);
        setCohort({
          id: `demo-cohort-${window.start}`,
          name: 'The Juniper Circle',
          stageWindowStart: window.start,
          stageWindowEnd: window.end,
          createdAt: new Date().toISOString(),
        });
        return;
      }

      if (!supabase) throw new Error('Supabase is not configured.');
      const { data } = await supabase.auth.getUser();
      if (!data.user) throw new Error('Your session has expired. Please sign in again.');
      await completeSupabaseIntake(data.user, input);
      await hydrateForUser(data.user);
    },
    [demoMode, hydrateForUser, user],
  );

  const submitPost = useCallback(
    async ({ body, isAnonymous }: NewPostInput): Promise<SubmitPostResult> => {
      if (!user || !cohort || !profile) throw new Error('Your cohort is not ready yet.');
      const cleanBody = body.trim();
      if (!cleanBody) throw new Error('Write something before posting.');
      if (cleanBody.length > 4000) throw new Error('Posts can be up to 4,000 characters.');

      const crisisMatched = containsCrisisLanguage(cleanBody);
      if (demoMode) {
        setPosts((current) => [
          {
            id: `demo-post-${Date.now()}`,
            cohortId: cohort.id,
            authorId: user.id,
            authorName: profile.displayName,
            body: cleanBody,
            isAnonymous,
            flagged: false,
            createdAt: new Date().toISOString(),
            myReactions: [],
          },
          ...current,
        ]);
        if (crisisMatched) {
          setRequiresSafetyAcknowledgement(true);
          await setSafetyPending(user.id);
        }
        return { crisisMatched };
      }

      const serverCrisisMatched = await insertPost(cohort.id, cleanBody, isAnonymous);
      if (serverCrisisMatched) {
        setRequiresSafetyAcknowledgement(true);
        await setSafetyPending(user.id);
      }
      void getPosts(cohort.id).then(setPosts).catch(() => {
        // The post RPC already committed successfully. Realtime or pull-to-refresh
        // will reconcile the feed without misreporting the post as failed.
      });
      return { crisisMatched: serverCrisisMatched };
    },
    [cohort, demoMode, profile, user],
  );

  const toggleReaction = useCallback(
    async (postId: string, type: ReactionType) => {
      if (!user) return;
      const post = posts.find((candidate) => candidate.id === postId);
      if (!post) return;
      const active = post.myReactions.includes(type);
      setPosts((current) =>
        current.map((candidate) =>
          candidate.id === postId
            ? {
                ...candidate,
                myReactions: active
                  ? candidate.myReactions.filter((reaction) => reaction !== type)
                  : [...candidate.myReactions, type],
              }
            : candidate,
        ),
      );
      if (!demoMode) {
        try {
          await toggleSupabaseReaction(postId, user.id, type, active);
        } catch (error) {
          setPosts((current) =>
            current.map((candidate) => (candidate.id === postId ? post : candidate)),
          );
          throw error;
        }
      }
    },
    [demoMode, posts, user],
  );

  const flagConcern = useCallback(
    async (input: ConcernInput) => {
      if (!user) throw new Error('Sign in before flagging a concern.');
      if (!input.reason.trim()) throw new Error('Please share a brief reason.');
      if (!demoMode) await insertConcern(user.id, { ...input, reason: input.reason.trim() });
    },
    [demoMode, user],
  );

  const setAnonymousMode = useCallback(
    async (value: boolean) => {
      if (!user || !profile) return;
      const previous = profile;
      setProfile({ ...profile, isAnonymous: value });
      if (!demoMode) {
        try {
          await updateSupabaseAnonymousMode(user.id, value);
        } catch (error) {
          setProfile(previous);
          throw error;
        }
      }
    },
    [demoMode, profile, user],
  );

  const acknowledgeSafetyResources = useCallback(async () => {
    if (!user) throw new Error('Sign in before acknowledging these resources.');
    if (!demoMode) await acknowledgeSupabaseSafetyResources();
    await clearSafetyPending(user.id);
    setRequiresSafetyAcknowledgement(false);
  }, [demoMode, user]);

  const value = useMemo<AppContextValue>(
    () => ({
      loading,
      refreshing,
      startupError,
      demoMode,
      user,
      profile,
      cohort,
      members,
      posts,
      hasCompletedIntake: Boolean(profile && cohort),
      requiresSafetyAcknowledgement,
      signIn,
      signUp,
      enterDemo,
      signOut,
      completeIntake,
      submitPost,
      toggleReaction,
      flagConcern,
      setAnonymousMode,
      acknowledgeSafetyResources,
      refresh,
    }),
    [
      loading,
      refreshing,
      startupError,
      demoMode,
      user,
      profile,
      cohort,
      members,
      posts,
      requiresSafetyAcknowledgement,
      signIn,
      signUp,
      enterDemo,
      signOut,
      completeIntake,
      submitPost,
      toggleReaction,
      flagConcern,
      setAnonymousMode,
      acknowledgeSafetyResources,
      refresh,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider.');
  return value;
}
