import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { LeafMark } from '@/components/LeafMark';
import { ThreadLine } from '@/components/ThreadLine';
import { colors, spacing } from '@/theme/tokens';

type PageHeaderProps = { title: string; context: string; threadLabel?: string };

export function PageHeader({ title, context, threadLabel }: PageHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>
        <AppText variant="title">Neova</AppText>
        <View style={styles.contextRow}>
          <LeafMark size={28} />
          <AppText variant="caption" color={colors.charcoalSoft}>
            {context}
          </AppText>
        </View>
      </View>
      <AppText variant="display" style={styles.title}>
        {title}
      </AppText>
      <ThreadLine label={threadLabel} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: spacing.sm },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  contextRow: { maxWidth: 150, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { marginTop: spacing.xl },
});
