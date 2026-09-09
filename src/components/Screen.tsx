import type { ReactNode } from 'react';
import type { RefreshControlProps, ViewStyle } from 'react-native';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme/tokens';

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
  refreshControl?: React.ReactElement<RefreshControlProps>;
};

export function Screen({ children, scroll = true, contentStyle, refreshControl }: ScreenProps) {
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, contentStyle]}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.flex, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  flex: { flex: 1 },
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    boxSizing: 'border-box',
    paddingHorizontal: spacing.xl,
    paddingBottom: 120,
    backgroundColor: colors.cream,
  },
});
