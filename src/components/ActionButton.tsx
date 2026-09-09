import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { PressableScale } from '@/components/PressableScale';
import { colors, radii, spacing } from '@/theme/tokens';

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  tone?: 'primary' | 'secondary' | 'text';
  testID?: string;
};

export function ActionButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  tone = 'primary',
  testID,
}: ActionButtonProps) {
  const textColor = tone === 'primary' ? colors.white : colors.terracottaDark;
  return (
    <PressableScale
      accessibilityLabel={label}
      disabled={disabled || loading}
      onPress={onPress}
      style={[styles.base, styles[tone]]}
      testID={testID}
    >
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={textColor} size="small" /> : null}
        <AppText variant="bodyMedium" color={textColor}>
          {loading ? 'Please wait…' : label}
        </AppText>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  primary: {
    backgroundColor: colors.terracottaDark,
  },
  secondary: {
    backgroundColor: colors.transparent,
    borderColor: colors.terracotta,
    borderWidth: 1,
  },
  text: {
    minHeight: 48,
    backgroundColor: colors.transparent,
    paddingHorizontal: spacing.sm,
  },
});
