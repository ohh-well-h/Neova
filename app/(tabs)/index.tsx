import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Platform, RefreshControl, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ReduceMotion } from 'react-native-reanimated';

import { AppText } from '@/components/AppText';
import { AvatarMark } from '@/components/AvatarMark';
import { PageHeader } from '@/components/PageHeader';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { useApp } from '@/providers/AppProvider';
import { showAlert } from '@/services/alerts';
import { weeksPostpartum } from '@/services/cohortMatching';
import { colors, radii, spacing } from '@/theme/tokens';
import type { CohortPost, ReactionType } from '@/types/models';

const reactionOptions: {
  type: ReactionType;
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
}[] = [
  { type: 'sending_strength', label: 'Sending strength', icon: 'weather-sunny' },
  { type: 'same', label: 'Same', icon: 'account-group-outline' },
  { type: 'here_for_you', label: 'Here for you', icon: 'leaf' },
];

const relativeTime = (value: string) => {
  const minutes = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr`;
  return `${Math.floor(hours / 24)} d`;
};

function PostRow({ post }: { post: CohortPost }) {
  const { toggleReaction } = useApp();
  const author = post.isAnonymous ? 'Anonymous' : post.authorName;
  return (
    <View style={styles.post}>
      <View style={styles.authorRow}>
        <AvatarMark name={post.isAnonymous ? undefined : author} tone={post.isAnonymous ? 'sage' : 'terracotta'} />
        <View style={styles.authorCopy}>
          <AppText variant="bodyMedium">{author}</AppText>
          <AppText variant="caption" color={colors.charcoalSoft}>{relativeTime(post.createdAt)}</AppText>
        </View>
        <MaterialCommunityIcons color={colors.sage} name="leaf" size={19} />
      </View>
      <AppText style={styles.postBody}>{post.body}</AppText>
      <View style={styles.reactions}>
        {reactionOptions.map((reaction) => {
          const active = post.myReactions.includes(reaction.type);
          return (
            <PressableScale
              key={reaction.type}
              accessibilityLabel={`${active ? 'Remove' : 'Send'} ${reaction.label}`}
              accessibilityState={{ selected: active }}
              onPress={() => {
                void Haptics.selectionAsync();
                void toggleReaction(post.id, reaction.type).catch(() => {
                  showAlert('Could not update reaction', 'Your reaction was restored. Try again shortly.');
                });
              }}
              style={styles.reaction}
            >
              <MaterialCommunityIcons
                color={active ? colors.terracottaDark : colors.sageDark}
                name={reaction.icon}
                size={20}
              />
              <AppText variant="caption" color={active ? colors.terracottaDark : colors.charcoalSoft}>
                {reaction.label}
              </AppText>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { profile, cohort, posts, refreshing, refresh } = useApp();
  const name = profile?.displayName?.split(' ')[0] ?? 'there';
  const week = profile ? weeksPostpartum(profile.postpartumStartDate) : 0;

  return (
    <Screen
      refreshControl={
        <RefreshControl
          colors={[colors.terracotta]}
          refreshing={refreshing}
          tintColor={colors.terracotta}
          onRefresh={() => void refresh()}
        />
      }
    >
      <PageHeader
        context={cohort?.name.replace('The ', '') ?? 'Your circle'}
        threadLabel={`Week ${week}`}
        title={`Good morning, ${name}`}
      />
      <AppText variant="title" color={colors.charcoalSoft} style={styles.subtitle}>Your circle is here.</AppText>
      {Platform.OS === 'web' ? (
        <PressableScale
          accessibilityLabel="Refresh circle posts"
          accessibilityState={{ busy: refreshing }}
          disabled={refreshing}
          onPress={() => void refresh()}
          style={styles.webRefresh}
        >
          <MaterialCommunityIcons color={colors.sageDark} name="refresh" size={20} />
          <AppText color={colors.sageDark} variant="bodyMedium">
            {refreshing ? 'Refreshing circle...' : 'Refresh circle'}
          </AppText>
        </PressableScale>
      ) : null}

      <Animated.View entering={FadeIn.duration(220).reduceMotion(ReduceMotion.System)} style={styles.checkIn}>
        <AppText variant="title" color={colors.white}>What has felt heavier than expected this week?</AppText>
        <PressableScale onPress={() => router.push('/compose')} style={styles.checkInAction}>
          <MaterialCommunityIcons color={colors.charcoal} name="pencil-outline" size={22} />
          <AppText variant="bodyMedium">Share a check-in</AppText>
        </PressableScale>
      </Animated.View>

      <PressableScale accessibilityLabel="Create a post" onPress={() => router.push('/compose')} style={styles.composer}>
        <AvatarMark name={profile?.displayName} size={44} />
        <AppText color={colors.muted}>Share with your circle…</AppText>
      </PressableScale>

      <View style={styles.feed}>
        {posts.length ? posts.map((post) => <PostRow key={post.id} post={post} />) : (
          <View style={styles.empty}>
            <AppText variant="heading">Your circle is quiet right now.</AppText>
            <AppText color={colors.charcoalSoft}>You can be the first to check in. There is no pressure to say much.</AppText>
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  webRefresh: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.sm,
    marginTop: -spacing.md,
    marginBottom: spacing.lg,
  },
  subtitle: { marginTop: -spacing.xl, marginBottom: spacing.xl },
  checkIn: {
    gap: spacing.xl,
    padding: spacing.xl,
    borderRadius: radii.lg,
    backgroundColor: colors.terracottaDark,
  },
  checkInAction: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.paper,
  },
  composer: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.lg,
    backgroundColor: colors.paper,
  },
  feed: { marginTop: spacing.sm },
  post: { paddingVertical: spacing.xl, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  authorRow: { flexDirection: 'row', alignItems: 'center' },
  authorCopy: { flex: 1, marginLeft: spacing.md },
  postBody: { marginTop: spacing.lg },
  reactions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg, gap: spacing.xs },
  reaction: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  empty: { gap: spacing.md, paddingVertical: spacing.xxxl },
});
