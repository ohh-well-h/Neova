import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ActionButton } from '@/components/ActionButton';
import { AppText } from '@/components/AppText';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { articles } from '@/content/articles';
import { colors, radii, spacing } from '@/theme/tokens';

export default function ArticleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const article = articles.find((candidate) => candidate.slug === slug);

  if (!article) {
    return (
      <Screen contentStyle={styles.notFound} scroll={false}>
        <AppText variant="title">Article not found</AppText>
        <ActionButton label="Back to Learn" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen contentStyle={styles.content}>
      <PressableScale onPress={() => router.back()} style={styles.back}>
        <MaterialCommunityIcons color={colors.terracottaDark} name="chevron-left" size={24} />
        <AppText variant="bodyMedium" color={colors.terracottaDark}>Learn</AppText>
      </PressableScale>
      <AppText variant="display" style={styles.title}>{article.title}</AppText>
      <AppText variant="subheading" color={colors.charcoalSoft}>{article.subtitle}</AppText>
      <AppText variant="caption" color={colors.muted} style={styles.readTime}>{article.minutes} min read</AppText>
      <View style={styles.rule} />
      <View style={styles.body}>
        {article.paragraphs.map((paragraph) => <AppText key={paragraph}>{paragraph}</AppText>)}
      </View>
      <View style={styles.source}>
        <AppText variant="subheading">Official source</AppText>
        <AppText variant="caption" color={colors.charcoalSoft}>Open the source for complete, current guidance.</AppText>
        <ActionButton label={article.sourceLabel} tone="secondary" onPress={() => void Linking.openURL(article.sourceUrl)} />
      </View>
      <PressableScale onPress={() => router.push('/crisis-resources')} style={styles.support}>
        <MaterialCommunityIcons color={colors.white} name="lifebuoy" size={26} />
        <View style={styles.supportCopy}>
          <AppText variant="bodyMedium" color={colors.white}>Crisis and postpartum support</AppText>
          <AppText variant="caption" color={colors.cream}>988 and the PSI HelpLine</AppText>
        </View>
        <MaterialCommunityIcons color={colors.white} name="chevron-right" size={24} />
      </PressableScale>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.lg },
  back: { minHeight: 44, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  title: { marginTop: spacing.xxl },
  readTime: { marginTop: spacing.sm },
  rule: { height: 1, marginVertical: spacing.xxl, backgroundColor: colors.line },
  body: { gap: spacing.xl },
  source: { gap: spacing.md, marginTop: spacing.xxxl, padding: spacing.xl, borderRadius: radii.lg, backgroundColor: colors.sageSoft },
  support: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.xl, padding: spacing.lg, borderRadius: radii.lg, backgroundColor: colors.terracottaDark },
  supportCopy: { flex: 1 },
  notFound: { justifyContent: 'center', gap: spacing.xl },
});
