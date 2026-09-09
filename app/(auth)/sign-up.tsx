import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ActionButton } from '@/components/ActionButton';
import { AppText } from '@/components/AppText';
import { FormField } from '@/components/FormField';
import { Screen } from '@/components/Screen';
import { useApp } from '@/providers/AppProvider';
import { colors, spacing } from '@/theme/tokens';

export default function SignUpScreen() {
  const { signUp } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    setMessage('');
    if (!email.trim() || password.length < 6) {
      setError('Enter your email and choose a password of at least six characters.');
      return;
    }
    setLoading(true);
    try {
      const result = await signUp(email, password);
      if (result.needsEmailConfirmation) {
        setMessage('Check your email to confirm your account, then return here to sign in.');
      } else {
        router.replace('/(onboarding)/intake');
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'We could not create your account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen contentStyle={styles.content}>
      <ActionButton label="Back to sign in" tone="text" onPress={() => router.back()} />
      <View style={styles.intro}>
        <AppText variant="display">Find your circle.</AppText>
        <AppText color={colors.charcoalSoft}>
          We ask only what is needed to place you with women at a similar stage.
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
          autoComplete="new-password"
          label="Password"
          onChangeText={setPassword}
          placeholder="At least 6 characters"
          secureTextEntry
          value={password}
        />
        {error ? <AppText color={colors.danger}>{error}</AppText> : null}
        {message ? <AppText color={colors.sageDark}>{message}</AppText> : null}
        <ActionButton label="Create account" loading={loading} onPress={() => void submit()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.lg },
  intro: { marginTop: spacing.xxxl, gap: spacing.lg },
  form: { marginTop: spacing.xxxl, gap: spacing.lg },
});
