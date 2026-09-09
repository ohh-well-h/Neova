import type { StyleProp, TextProps, TextStyle } from 'react-native';
import { StyleSheet, Text } from 'react-native';

import { colors, fonts, typeScale } from '@/theme/tokens';

type Variant = 'display' | 'title' | 'heading' | 'subheading' | 'body' | 'bodyMedium' | 'caption';

type AppTextProps = TextProps & {
  variant?: Variant;
  color?: string;
  style?: StyleProp<TextStyle>;
};

export function AppText({
  variant = 'body',
  color = colors.charcoal,
  style,
  accessibilityRole,
  ...props
}: AppTextProps) {
  const isHeading = ['display', 'title', 'heading'].includes(variant);
  return (
    <Text
      accessibilityRole={accessibilityRole ?? (isHeading ? 'header' : undefined)}
      allowFontScaling
      style={[styles.base, styles[variant], { color }, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: fonts.body,
    lineHeight: 24,
  },
  display: {
    fontFamily: fonts.display,
    fontSize: typeScale.display,
    lineHeight: 48,
    letterSpacing: -1.2,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: typeScale.title,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  heading: {
    fontFamily: fonts.display,
    fontSize: typeScale.heading,
    lineHeight: 30,
  },
  subheading: {
    fontFamily: fonts.bodySemibold,
    fontSize: typeScale.subheading,
    lineHeight: 26,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: typeScale.body,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.body,
    lineHeight: 24,
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: typeScale.bodySmall,
    lineHeight: 20,
  },
});
