import { StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { PressableScale } from '@/components/PressableScale';
import { colors, radii, spacing } from '@/theme/tokens';

type ChoiceChipProps = { label: string; selected: boolean; onPress: () => void };

export function ChoiceChip({ label, selected, onPress }: ChoiceChipProps) {
  return (
    <PressableScale
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[styles.base, selected && styles.selected]}
    >
      <AppText variant="caption" color={selected ? colors.white : colors.charcoal}>
        {label}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.round,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.paper,
  },
  selected: { borderColor: colors.terracottaDark, backgroundColor: colors.terracottaDark },
});
