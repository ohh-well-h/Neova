import { Platform } from 'react-native';

export const colors = {
  cream: '#FAF6F1',
  creamDeep: '#F1E9DF',
  paper: '#FFFDF9',
  terracotta: '#C6714A',
  terracottaDark: '#9E5132',
  terracottaSoft: '#F2DDD0',
  sage: '#8A9A7E',
  sageDark: '#65735B',
  sageSoft: '#E2E7DD',
  charcoal: '#2E2A26',
  charcoalSoft: '#625C56',
  muted: '#6E6862',
  line: '#D9CFC3',
  danger: '#A84C3B',
  white: '#FFFFFF',
  transparent: 'transparent',
} as const;

export const fonts = {
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
  display: 'Fraunces_600SemiBold',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const radii = {
  sm: 10,
  md: 14,
  lg: 16,
  round: 999,
} as const;

export const typeScale = {
  display: 44,
  title: 32,
  heading: 24,
  subheading: 19,
  body: 16,
  bodySmall: 14,
  caption: 12,
} as const;

export const elevation = Platform.select({
  ios: {
    shadowColor: colors.charcoal,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  android: { elevation: 2 },
  default: {
    shadowColor: colors.charcoal,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
});
