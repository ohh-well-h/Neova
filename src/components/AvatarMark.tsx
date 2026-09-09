import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { LeafMark } from '@/components/LeafMark';
import { colors, radii } from '@/theme/tokens';

type AvatarMarkProps = { name?: string; size?: number; tone?: 'sage' | 'terracotta' | 'cream' };

export function AvatarMark({ name, size = 48, tone = 'sage' }: AvatarMarkProps) {
  const background =
    tone === 'terracotta' ? colors.terracottaSoft : tone === 'cream' ? colors.creamDeep : colors.sageSoft;
  return (
    <View style={[styles.base, { width: size, height: size, borderRadius: radii.round, backgroundColor: background }]}>
      {name ? (
        <AppText variant="bodyMedium" color={tone === 'terracotta' ? colors.terracottaDark : colors.sageDark}>
          {name.slice(0, 1).toUpperCase()}
        </AppText>
      ) : (
        <LeafMark size={size * 0.62} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({ base: { alignItems: 'center', justifyContent: 'center' } });
