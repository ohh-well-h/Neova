import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { ActionButton } from '@/components/ActionButton';
import { AppText } from '@/components/AppText';
import { ChoiceChip } from '@/components/ChoiceChip';
import { Screen } from '@/components/Screen';
import { useApp } from '@/providers/AppProvider';
import { colors, fonts, radii, spacing, typeScale } from '@/theme/tokens';

export default function FlagConcernScreen() {
  const { members, flagConcern } = useApp();
  const [subjectUserId, setSubjectUserId] = useState<string | undefined>();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submit = async () => {
    setError('');
    if (!subjectUserId) return setError('Choose the person you are concerned about.');
    if (!reason.trim()) return setError('Share a brief reason so the moderation team can review it.');
    setLoading(true);
    try {
      await flagConcern({ subjectUserId, reason });
      setSubmitted(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The concern could not be sent.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Screen contentStyle={styles.success} scroll={false}>
        <Stack.Screen options={{ gestureEnabled: false }} />
        <View style={styles.successIcon}><MaterialCommunityIcons color={colors.white} name="check" size={34} /></View>
        <AppText variant="title">Concern sent privately.</AppText>
        <AppText color={colors.charcoalSoft} style={styles.center}>It is not visible to the circle. Neova does not notify the member who submitted it.</AppText>
        <ActionButton label="Done" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <AppText variant="title">Flag a concern privately</AppText>
          <AppText variant="caption" color={colors.charcoalSoft}>This goes only to the Neova moderation queue.</AppText>
        </View>
        <ActionButton label="Cancel" tone="text" onPress={() => router.back()} />
      </View>
      <View style={styles.section}>
        <AppText variant="subheading">Who are you concerned about?</AppText>
        <View style={styles.chips}>
          {members.map((member) => (
            <ChoiceChip key={member.userId} label={member.displayName} selected={subjectUserId === member.userId} onPress={() => setSubjectUserId(member.userId)} />
          ))}
        </View>
      </View>
      <View style={styles.section}>
        <AppText variant="subheading">What made you concerned?</AppText>
        <TextInput
          accessibilityLabel="Reason for concern"
          maxLength={1000}
          multiline
          onChangeText={setReason}
          placeholder="A brief, factual note is enough."
          placeholderTextColor={colors.muted}
          selectionColor={colors.terracotta}
          style={styles.input}
          textAlignVertical="top"
          value={reason}
        />
      </View>
      {error ? <AppText color={colors.danger}>{error}</AppText> : null}
      <ActionButton label="Send private concern" loading={loading} onPress={() => void submit()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.xl },
  header: { flexDirection: 'row', alignItems: 'flex-start' },
  headerCopy: { flex: 1, gap: spacing.sm },
  section: { marginTop: spacing.xxl, gap: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  input: { minHeight: 150, padding: spacing.lg, borderWidth: 1, borderColor: colors.line, borderRadius: radii.lg, backgroundColor: colors.paper, color: colors.charcoal, fontFamily: fonts.body, fontSize: typeScale.body, lineHeight: 24 },
  success: { justifyContent: 'center', gap: spacing.xl },
  successIcon: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center', borderRadius: 32, backgroundColor: colors.sageDark },
  center: { maxWidth: 420 },
});
