import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { CrisisResourcesCard } from '@/components/CrisisResourcesCard';
import { PageHeader } from '@/components/PageHeader';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { articles } from '@/content/articles';
import { useApp } from '@/providers/AppProvider';
import { weeksPostpartum } from '@/services/cohortMatching';
import { colors, radii, spacing } from '@/theme/tokens';

const stages = [
  { label: 'Weeks 0–5', week: 3 },
  { label: 'Weeks 6–10', week: 8 },
  { label: 'Weeks 11+', week: 16 },
];

export default function LearnScreen() {
  const { profile } = useApp();
  const currentWeek = profile ? weeksPostpartum(profile.postpartumStartDate) : 8;
  const initial = currentWeek <= 5 ? 3 : currentWeek <= 10 ? 8 : 16;
  const [selectedWeek, setSelectedWeek] = useState(initial);
  const visibleArticles = useMemo(
    () => articles.filter((article) => selectedWeek >= article.stageStart && selectedWeek <= article.stageEnd),
    [selectedWeek],
  );

  return (
    <Screen>
      <PageHeader context="Stage library" threadLabel={stages.find((stage) => stage.week === selectedWeek)?.label} title="Learn" />
      <CrisisResourcesCard />

      <View style={styles.section}>
        <AppText variant="heading">Explore by stage</AppText>
        <View style={styles.stageRow}>
          {stages.map((stage) => {
            const active = stage.week === selectedWeek;
            return (
              <PressableScale
                key={stage.label}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                onPress={() => setSelectedWeek(stage.week)}
                style={[styles.stage, active && styles.stageActive]}
              >
                <AppText variant="caption" color={active ? colors.white : colors.charcoalSoft}>{stage.label}</AppText>
              </PressableScale>
            );
          })}
        </View>
      </View>

      <View style={styles.articleSection}>
        <AppText variant="heading">For this stage</AppText>
        {visibleArticles.map((article, index) => (
          <PressableScale
            key={article.slug}
            onPress={() => router.push({ pathname: '/article/[slug]', params: { slug: article.slug } })}
            style={[styles.article, index === 0 && styles.leadArticle]}
          >
            <View style={[styles.articleMark, index === 0 && styles.articleMarkLead]}>
              <MaterialCommunityIcons color={index === 0 ? colors.white : colors.sageDark} name={index === 0 ? 'weather-night' : 'leaf'} size={28} />
            </View>
            <View style={styles.articleCopy}>
              <AppText variant={index === 0 ? 'heading' : 'subheading'}>{article.title}</AppText>
              <AppText variant="caption" color={colors.charcoalSoft}>{article.subtitle}</AppText>
              <AppText variant="caption" color={colors.muted}>{article.minutes} min read</AppText>
            </View>
            <MaterialCommunityIcons color={colors.charcoal} name="chevron-right" size={26} />
          </PressableScale>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.xxl, gap: spacing.md },
  stageRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.line, paddingBottom: spacing.sm },
  stage: { minHeight: 48, justifyContent: 'center', paddingHorizontal: spacing.md, borderRadius: radii.round },
  stageActive: { backgroundColor: colors.terracottaDark },
  articleSection: { marginTop: spacing.xxl },
  article: { minHeight: 92, flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line, paddingVertical: spacing.lg },
  leadArticle: { marginTop: spacing.md, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.line, borderRadius: radii.lg, backgroundColor: colors.paper },
  articleMark: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 24, backgroundColor: colors.sageSoft },
  articleMarkLead: { width: 78, height: 78, borderRadius: radii.md, backgroundColor: colors.terracotta },
  articleCopy: { flex: 1, gap: spacing.xs },
});
