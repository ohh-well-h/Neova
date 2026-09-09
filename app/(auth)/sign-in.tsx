import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ActionButton } from '@/components/ActionButton';
import { AppText } from '@/components/AppText';
import { FormField } from '@/components/FormField';
import { LeafMark } from '@/components/LeafMark';
import { Screen } from '@/components/Screen';
import { env } from '@/lib/env';
import { useApp } from '@/providers/AppProvider';
import { colors, spacing } from '@/theme/tokens';

export default function SignInScreen() {
  const { signIn, enterDemo } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    if (!email.trim() || password.length < 6) {
      setError('Enter your email and a password of at least six characters.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'We could not sign you in. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.brand}>
        <LeafMark size={42} />
        <AppText variant="title">Neova</AppText>
      </View>
      <View style={styles.intro}>
        <AppText variant="display">Come as you are.</AppText>
        <AppText color={colors.charcoalSoft}>
          A private circle of women moving through a similar postpartum stage.
        </AppText>
      </View>
      <View style={styles.form}>
        <FormField
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          label="Email"
          onChangeText={setEmail}
          placeholder="you@example.com"
          value={email}
        />
        <FormField
          autoCapitalize="none"
          autoComplete="current-password"
          label="Password"
          onChangeText={setPassword}
          onSubmitEditing={() => void submit()}
          placeholder="At least 6 characters"
          secureTextEntry
          value={password}
        />
        {error ? <AppText color={colors.danger}>{error}</AppText> : null}
        <ActionButton label="Sign in" loading={loading} onPress={() => void submit()} />
        <ActionButton label="Create an account" tone="secondary" onPress={() => router.push('/(auth)/sign-up')} />
      </View>
      <View style={styles.demo}>
        <AppText variant="caption" color={colors.charcoalSoft}>
          {env.isSupabaseConfigured
            ? 'Want to look around first? Demo content stays on this device.'
            : 'Supabase is not configured. Demo mode keeps everything local.'}
        </AppText>
        <ActionButton
          label="Explore demo"
          tone="text"
          onPress={() => {
            void enterDemo().then(() => {
              router.replace('/(tabs)');
            }).catch((cause: unknown) => {
              setError(cause instanceof Error ? cause.message : 'Demo mode could not start.');
            });
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.xl },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  intro: { marginTop: 64, gap: spacing.lg },
  form: { marginTop: spacing.xxxl, gap: spacing.lg },
  demo: { marginTop: spacing.xxl, alignItems: 'center', gap: spacing.sm },
});
