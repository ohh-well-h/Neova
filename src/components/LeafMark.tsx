import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/theme/tokens';

type LeafMarkProps = { size?: number; color?: string; accent?: string };

export function LeafMark({ size = 32, color = colors.sageDark, accent = colors.terracotta }: LeafMarkProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" accessibilityElementsHidden>
      <Path d="M15.8 27.5V12.8" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M15.7 16.4C8.1 14.8 5 9.8 5.2 3.8c6.4.4 10.6 4.3 10.5 12.6Z" fill={color} />
      <Path d="M16.2 20.4c7.3-1.6 10.2-6.2 10-11.8-6.1.4-10.1 4-10 11.8Z" fill={accent} />
      <Circle cx={15.8} cy={27.5} r={1.4} fill={color} />
    </Svg>
  );
}
