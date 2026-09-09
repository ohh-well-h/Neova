import type { TextInputProps } from 'react-native';
import { StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors, fonts, radii, spacing, typeScale } from '@/theme/tokens';

type FormFieldProps = TextInputProps & { label: string; error?: string };

export function FormField({ label, error, style, ...props }: FormFieldProps) {
  return (
    <View style={styles.group}>
      <AppText variant="caption" color={colors.charcoalSoft}>
        {label}
      </AppText>
      <TextInput
        accessibilityLabel={label}
        allowFontScaling
        placeholderTextColor={colors.muted}
        selectionColor={colors.terracotta}
        style={[styles.input, error && styles.errorInput, style]}
        {...props}
      />
      {error ? (
        <AppText accessibilityLiveRegion="polite" accessibilityRole="alert" variant="caption" color={colors.danger}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing.sm },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    backgroundColor: colors.paper,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.charcoal,
    fontFamily: fonts.body,
    fontSize: typeScale.body,
  },
  errorInput: { borderColor: colors.danger },
});
