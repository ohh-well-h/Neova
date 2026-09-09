import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { AppText } from '@/components/AppText';
import { colors } from '@/theme/tokens';

type ThreadLineProps = { label?: string; height?: number };

export function ThreadLine({ label, height = 54 }: ThreadLineProps) {
  return (
    <View style={[styles.container, { height }]}>
      <Svg width="100%" height={height} viewBox="0 0 360 54" preserveAspectRatio="none">
        <Path
          d="M0 30 C74 5 142 50 220 26 C278 8 318 6 360 20"
          fill="none"
          stroke={colors.sageDark}
          strokeWidth={1.2}
        />
        <Circle cx={255} cy={18} r={6} fill={colors.terracotta} />
      </Svg>
      {label ? (
        <AppText variant="caption" color={colors.charcoalSoft} style={styles.label}>
          {label}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', position: 'relative' },
  label: { position: 'absolute', right: 0, top: 25 },
});
