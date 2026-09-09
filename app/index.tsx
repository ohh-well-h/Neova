import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ActionButton } from '@/components/ActionButton';
import { AppText } from '@/components/AppText';
import { LeafMark } from '@/components/LeafMark';
import { useApp } from '@/providers/AppProvider';
import { colors, spacing } from '@/theme/tokens';

export default function Index() {
  const {
    loading,
    user,
    hasCompletedIntake,
    refresh,
    requiresSafetyAcknowledgement,
    startupError,
  } = useApp();
  if (loading) {
    return (
      <View style={styles.loading}>
        <LeafMark size={48} />
        <AppText variant="title">Neova</AppText>
        <ActivityIndicator color={colors.terracotta} />
      </View>
    );
  }
  if (startupError) {
    return (
      <View style={styles.loading}>
        <LeafMark size={48} />
        <AppText variant="heading">Your circle did not load.</AppText>
        <AppText color={colors.charcoalSoft} style={styles.errorCopy}>{startupError}</AppText>
        <ActionButton label="Try again" onPress={() => void refresh()} />
      </View>
    );
  }
  if (!user) return <Redirect href="/(auth)/sign-in" />;
  if (requiresSafetyAcknowledgement) {
    return <Redirect href={{ pathname: '/crisis-resources', params: { required: '1' } }} />;
  }
  if (!hasCompletedIntake) return <Redirect href="/(onboarding)/intake" />;
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    backgroundColor: colors.cream,
  },
  errorCopy: { maxWidth: 360, textAlign: 'center' },
});
