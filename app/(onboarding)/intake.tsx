import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ActionButton } from '@/components/ActionButton';
import { AppText } from '@/components/AppText';
import { ChoiceChip } from '@/components/ChoiceChip';
import { FormField } from '@/components/FormField';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { useApp } from '@/providers/AppProvider';
import { colors, radii, spacing } from '@/theme/tokens';
import type { BirthExperience, SupportPreference } from '@/types/models';

const birthOptions: { value: BirthExperience; label: string }[] = [
  { value: 'vaginal', label: 'Vaginal birth' },
  { value: 'c-section', label: 'C-section' },
  { value: 'nicu', label: 'NICU stay' },
  { value: 'loss', label: 'Loss' },
  { value: 'multiples', label: 'Multiples' },
];

const supportOptions: { value: SupportPreference; label: string }[] = [
  { value: 'venting', label: 'A place to vent' },
  { value: 'advice', label: 'Practical advice' },
  { value: 'company', label: 'Company' },
];

const toggle = <T,>(list: T[], value: T) =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

export default function IntakeScreen() {
  const { completeIntake } = useApp();
  const [displayName, setDisplayName] = useState('');
  const [weeks, setWeeks] = useState(8);
  const [birthExperiences, setBirthExperiences] = useState<BirthExperience[]>([]);
  const [supportPreferences, setSupportPreferences] = useState<SupportPreference[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const changeWeeks = (next: number) => {
    setWeeks(Math.max(0, Math.min(104, next)));
    void Haptics.selectionAsync();
  };

  const submit = async () => {
    setError('');
    if (!displayName.trim()) return setError('Choose the name your circle should see.');
    if (!birthExperiences.length) return setError('Select at least one birth experience.');
    if (!supportPreferences.length) return setError('Select at least one kind of support.');
    setLoading(true);
    try {
      await completeIntake({ displayName, weeksPostpartum: weeks, birthExperiences, supportPreferences });
      router.replace('/(tabs)');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'We could not place you in a circle.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen contentStyle={styles.content}>
      <AppText variant="display">A little about where you are.</AppText>
      <AppText color={colors.charcoalSoft} style={styles.lede}>
        Your answers place you in a small circle immediately. They are not posted to the feed.
      </AppText>

      <View style={styles.section}>
        <AppText variant="heading">What should we call you?</AppText>
        <FormField label="Display name" onChangeText={setDisplayName} placeholder="Your first name" value={displayName} />
      </View>

      <View style={styles.section}>
        <AppText variant="heading">How many weeks postpartum?</AppText>
        <View style={styles.stepper}>
          <PressableScale accessibilityLabel="Decrease weeks" onPress={() => changeWeeks(weeks - 1)} style={styles.stepButton}>
            <MaterialCommunityIcons color={colors.charcoal} name="minus" size={24} />
          </PressableScale>
          <View style={styles.weekValue}>
            <AppText variant="display" color={colors.terracottaDark}>{weeks}</AppText>
            <AppText variant="caption" color={colors.charcoalSoft}>weeks</AppText>
          </View>
          <PressableScale accessibilityLabel="Increase weeks" onPress={() => changeWeeks(weeks + 1)} style={styles.stepButton}>
            <MaterialCommunityIcons color={colors.charcoal} name="plus" size={24} />
          </PressableScale>
        </View>
      </View>

      <View style={styles.section}>
        <AppText variant="heading">Your birth experience</AppText>
        <AppText variant="caption" color={colors.charcoalSoft}>Choose every option that belongs to your story.</AppText>
        <View style={styles.chips}>
          {birthOptions.map((option) => (
            <ChoiceChip
              key={option.value}
              label={option.label}
              selected={birthExperiences.includes(option.value)}
              onPress={() => setBirthExperiences((current) => toggle(current, option.value))}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <AppText variant="heading">What are you looking for?</AppText>
        <View style={styles.chips}>
          {supportOptions.map((option) => (
            <ChoiceChip
              key={option.value}
              label={option.label}
              selected={supportPreferences.includes(option.value)}
              onPress={() => setSupportPreferences((current) => toggle(current, option.value))}
            />
          ))}
        </View>
      </View>

      {error ? <AppText color={colors.danger}>{error}</AppText> : null}
      <ActionButton label="Join my circle" loading={loading} onPress={() => void submit()} />
      <AppText variant="caption" color={colors.charcoalSoft} style={styles.note}>
        Cohorts are capped at 15 members. If the closest circle is full, Neova creates another for the same stage.
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.xl },
  lede: { marginTop: spacing.lg },
  section: { marginTop: spacing.xxxl, gap: spacing.md },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radii.lg,
    backgroundColor: colors.terracottaSoft,
    padding: spacing.lg,
  },
  stepButton: {
    width: 48,
    height: 48,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paper,
  },
  weekValue: { alignItems: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  note: { marginTop: spacing.md, textAlign: 'center' },
});
