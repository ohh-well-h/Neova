import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Switch, TextInput, View } from 'react-native';

import { ActionButton } from '@/components/ActionButton';
import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { useApp } from '@/providers/AppProvider';
import { colors, fonts, radii, spacing, typeScale } from '@/theme/tokens';

export default function ComposeScreen() {
  const { profile, submitPost } = useApp();
  const [body, setBody] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(profile?.isAnonymous ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await submitPost({ body, isAnonymous });
      if (result.crisisMatched) {
        router.replace({ pathname: '/crisis-resources', params: { required: '1' } });
      } else {
        router.back();
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Your post could not be shared.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen contentStyle={styles.content}>
      <Stack.Screen options={{ gestureEnabled: !loading }} />
      <View style={styles.headingRow}>
        <View style={styles.headingCopy}>
          <AppText variant="title">Share with your circle</AppText>
          <AppText variant="caption" color={colors.charcoalSoft}>Your post appears chronologically. There are no popularity scores.</AppText>
        </View>
        <ActionButton label="Cancel" tone="text" onPress={() => router.back()} />
      </View>

      <TextInput
        accessibilityLabel="Post text"
        autoFocus
        maxLength={4000}
        multiline
        onChangeText={setBody}
        placeholder="What would feel useful to say out loud?"
        placeholderTextColor={colors.muted}
        selectionColor={colors.terracotta}
        style={styles.input}
        textAlignVertical="top"
        value={body}
      />
      <AppText variant="caption" color={colors.charcoalSoft} style={styles.count}>{body.length} / 4,000</AppText>

      <View style={styles.settingRow}>
        <View style={styles.settingCopy}>
          <AppText variant="bodyMedium">Post as Anonymous</AppText>
          <AppText variant="caption" color={colors.charcoalSoft}>Your name is hidden from circle members on this post.</AppText>
        </View>
        <Switch
          accessibilityLabel="Post as Anonymous"
          ios_backgroundColor={colors.line}
          onValueChange={setIsAnonymous}
          thumbColor={colors.white}
          trackColor={{ false: colors.line, true: colors.sage }}
          value={isAnonymous}
        />
      </View>

      {error ? <AppText color={colors.danger}>{error}</AppText> : null}
      <ActionButton disabled={!body.trim()} label="Share post" loading={loading} onPress={() => void submit()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.xl },
  headingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  headingCopy: { flex: 1, gap: spacing.sm },
  input: {
    minHeight: 220,
    marginTop: spacing.xxl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.lg,
    backgroundColor: colors.paper,
    color: colors.charcoal,
    fontFamily: fonts.body,
    fontSize: typeScale.body,
    lineHeight: 24,
  },
  count: { alignSelf: 'flex-end', marginTop: spacing.xs },
  settingRow: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.xxl },
  settingCopy: { flex: 1, paddingRight: spacing.lg, gap: spacing.xs },
});
