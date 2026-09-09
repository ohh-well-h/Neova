import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { PressableScale } from '@/components/PressableScale';
import { openResource } from '@/services/resources';
import { colors, radii, spacing } from '@/theme/tokens';

type CrisisResourcesCardProps = { compact?: boolean };

export function CrisisResourcesCard({ compact = false }: CrisisResourcesCardProps) {
  return (
    <View style={[styles.card, compact && styles.compact]} accessibilityRole="summary">
      <AppText variant={compact ? 'heading' : 'subheading'} color={colors.white}>
        {compact ? 'Support is always within reach' : 'Need immediate emotional support?'}
      </AppText>
      <PressableScale
        accessibilityLabel="Call 988 Suicide and Crisis Lifeline"
        onPress={() => void openResource('tel:988', 'call 988')}
        style={styles.resourceRow}
      >
        <MaterialCommunityIcons color={colors.white} name="phone" size={24} />
        <View style={styles.resourceCopy}>
          <AppText variant="subheading" color={colors.white}>Call 988</AppText>
          {compact ? <AppText variant="caption" color={colors.cream}>24/7 mental health support</AppText> : null}
        </View>
      </PressableScale>
      <View style={styles.rule} />
      <PressableScale
        accessibilityLabel="Call Postpartum Support International HelpLine at 1 800 944 4773"
        onPress={() => void openResource('tel:18009444773', 'call the PSI HelpLine')}
        style={styles.resourceRow}
      >
        <MaterialCommunityIcons color={colors.cream} name="account-group" size={25} />
        <View style={styles.resourceCopy}>
          {!compact ? <AppText variant="caption" color={colors.cream}>Postpartum support & referrals</AppText> : null}
          <AppText variant="bodyMedium" color={colors.white}>PSI HelpLine · 1-800-944-4773</AppText>
          {compact ? <AppText variant="caption" color={colors.cream}>Postpartum support & referrals</AppText> : null}
        </View>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.terracottaDark,
    borderRadius: radii.lg,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  compact: { backgroundColor: colors.sageDark },
  resourceRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  resourceCopy: { flex: 1 },
  rule: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.55)' },
});
