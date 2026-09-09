import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { AppText } from '@/components/AppText';
import { AvatarMark } from '@/components/AvatarMark';
import { PageHeader } from '@/components/PageHeader';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { useApp } from '@/providers/AppProvider';
import { colors, radii, spacing } from '@/theme/tokens';

function StageTimeline({ start, end }: { start: number; end: number }) {
  return (
    <View style={styles.timeline} accessibilityLabel={`Current cohort stage: weeks ${start} to ${end}`}>
      <Svg width="100%" height={62} viewBox="0 0 340 62" preserveAspectRatio="none">
        <Path d="M20 28 C98 48 142 8 206 28 C260 45 298 22 320 28" fill="none" stroke={colors.sageDark} strokeWidth={2} />
        <Circle cx={20} cy={28} r={7} fill={colors.sage} />
        <Circle cx={170} cy={20} r={10} fill={colors.terracotta} />
        <Circle cx={320} cy={28} r={7} fill={colors.sage} />
      </Svg>
      <View style={styles.timelineLabels}>
        <View><AppText variant="caption">Settling in</AppText><AppText variant="caption" color={colors.muted}>Weeks 0–5</AppText></View>
        <View style={styles.centerLabel}><AppText variant="caption">Finding rhythm</AppText><AppText variant="caption" color={colors.muted}>Weeks {start}–{end}</AppText></View>
        <View style={styles.rightLabel}><AppText variant="caption">Looking ahead</AppText><AppText variant="caption" color={colors.muted}>Weeks {end + 1}+</AppText></View>
      </View>
    </View>
  );
}

export default function CircleScreen() {
  const { cohort, members } = useApp();
  const start = cohort?.stageWindowStart ?? 6;
  const end = cohort?.stageWindowEnd ?? 10;

  return (
    <Screen>
      <PageHeader context="Private cohort" threadLabel={`Weeks ${start}–${end}`} title="My Circle" />
      <View style={styles.hero}>
        <AppText variant="title" color={colors.white}>{cohort?.name ?? 'Your circle'}</AppText>
        <AppText color={colors.white}>{members.length} members · {start}–{end} weeks postpartum</AppText>
        <AppText color={colors.white}>A small group moving through this season together.</AppText>
      </View>

      <View style={styles.section}>
        <AppText variant="heading">Where we are</AppText>
        <StageTimeline end={end} start={start} />
      </View>

      <View style={styles.peopleHeader}>
        <AppText variant="heading">Your people</AppText>
        <AppText variant="caption" color={colors.charcoalSoft}>{members.length} of 15 places</AppText>
      </View>
      <ScrollView horizontal contentContainerStyle={styles.people} showsHorizontalScrollIndicator={false}>
        {members.map((member, index) => (
          <View key={member.userId} style={styles.person}>
            <AvatarMark name={member.displayName} size={58} tone={index % 2 ? 'sage' : 'terracotta'} />
            <AppText variant="caption" numberOfLines={1}>{member.displayName}</AppText>
          </View>
        ))}
      </ScrollView>

      <PressableScale onPress={() => router.push('/flag-concern')} style={styles.concern}>
        <View style={styles.concernIcon}>
          <MaterialCommunityIcons color={colors.sageDark} name="flag-outline" size={26} />
        </View>
        <View style={styles.concernCopy}>
          <AppText variant="subheading">Worried about someone?</AppText>
          <AppText color={colors.charcoalSoft}>Flag a concern privately</AppText>
          <AppText variant="caption" color={colors.muted}>Only the Neova moderation team will see it.</AppText>
        </View>
        <MaterialCommunityIcons color={colors.charcoal} name="chevron-right" size={26} />
      </PressableScale>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: spacing.md, padding: spacing.xl, borderRadius: radii.lg, backgroundColor: colors.terracottaDark },
  section: { marginTop: spacing.xxl, gap: spacing.md },
  timeline: { marginTop: spacing.sm },
  timelineLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -spacing.sm },
  centerLabel: { alignItems: 'center' },
  rightLabel: { alignItems: 'flex-end' },
  peopleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: spacing.xxxl },
  people: { gap: spacing.lg, paddingVertical: spacing.lg },
  person: { width: 62, alignItems: 'center', gap: spacing.sm },
  concern: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.xxl, paddingVertical: spacing.lg, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  concernIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sageSoft },
  concernCopy: { flex: 1 },
});
