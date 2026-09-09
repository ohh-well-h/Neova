import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, StyleSheet, Switch, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { AppText } from '@/components/AppText';
import { AvatarMark } from '@/components/AvatarMark';
import { PageHeader } from '@/components/PageHeader';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { env } from '@/lib/env';
import { useApp } from '@/providers/AppProvider';
import { showAlert } from '@/services/alerts';
import { beginWebCheckout } from '@/services/billing';
import { weeksPostpartum } from '@/services/cohortMatching';
import { colors, spacing } from '@/theme/tokens';

function StageLine({ week }: { week: number }) {
  const progress = Math.max(18, Math.min(92, 18 + (week / 12) * 74));
  return (
    <View>
      <Svg accessibilityLabel={`Postpartum week ${week}`} height={50} viewBox="0 0 320 50" width="100%">
        <Path d="M18 24 C88 24 102 24 152 24 C202 24 218 6 262 24 C280 30 294 25 304 24" fill="none" stroke={colors.sage} strokeWidth={2.5} />
        <Circle cx={18} cy={24} fill={colors.sage} r={6} />
        <Circle cx={152} cy={24} fill={colors.sage} r={6} />
        <Circle cx={progress * 3.2} cy={20} fill={colors.terracotta} r={8} />
        <Circle cx={304} cy={24} fill={colors.line} r={6} />
      </Svg>
      <View style={styles.stageLabels}>
        <AppText color={colors.muted} variant="caption">Birth</AppText>
        <AppText color={colors.muted} variant="caption">Week 6</AppText>
        <AppText color={colors.muted} variant="caption">Week 12+</AppText>
      </View>
    </View>
  );
}

type SettingsRowProps = {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  detail: string;
  onPress?: () => void;
};

function SettingsRow({ icon, label, detail, onPress }: SettingsRowProps) {
  return (
    <PressableScale disabled={!onPress} onPress={onPress} style={styles.settingsRow}>
      <View style={styles.settingsIcon}>
        <MaterialCommunityIcons color={colors.sageDark} name={icon} size={25} />
      </View>
      <View style={styles.settingsCopy}>
        <AppText variant="subheading">{label}</AppText>
        <AppText color={colors.muted}>{detail}</AppText>
      </View>
      {onPress ? <MaterialCommunityIcons color={colors.charcoal} name="chevron-right" size={25} /> : null}
    </PressableScale>
  );
}

export default function ProfileScreen() {
  const { cohort, demoMode, profile, setAnonymousMode, signOut } = useApp();
  const [savingAnonymous, setSavingAnonymous] = useState(false);
  const week = useMemo(
    () => (profile ? weeksPostpartum(profile.postpartumStartDate) : cohort?.stageWindowStart ?? 0),
    [cohort?.stageWindowStart, profile],
  );

  const updateAnonymous = async (value: boolean) => {
    setSavingAnonymous(true);
    try {
      await setAnonymousMode(value);
      void Haptics.selectionAsync();
    } catch (error) {
      showAlert('Could not update', error instanceof Error ? error.message : 'Try again shortly.');
    } finally {
      setSavingAnonymous(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/sign-in');
    } catch (error) {
      showAlert('Could not sign out', error instanceof Error ? error.message : 'Try again shortly.');
    }
  };

  const handleSubscription = async () => {
    try {
      await beginWebCheckout();
    } catch (error) {
      showAlert('Checkout is not ready', error instanceof Error ? error.message : 'Try again shortly.');
    }
  };

  return (
    <Screen>
      <PageHeader context={demoMode ? 'Demo profile' : 'Private profile'} title="Profile" />

      <View style={styles.identity}>
        <AvatarMark name={profile?.displayName ?? 'N'} size={78} tone="sage" />
        <View style={styles.identityCopy}>
          <AppText variant="title">{profile?.displayName ?? 'Your profile'}</AppText>
          <AppText color={colors.muted}>{profile?.email}</AppText>
        </View>
      </View>

      <View style={styles.stage}>
        <AppText variant="heading">Your postpartum stage</AppText>
        <AppText color={colors.terracotta} style={styles.week} variant="display">Week {week}</AppText>
        <StageLine week={week} />
      </View>

      <View style={styles.settings}>
        <View style={styles.settingsRow}>
          <View style={[styles.settingsIcon, styles.terracottaDisc]}>
            <MaterialCommunityIcons color={colors.terracottaDark} name="incognito" size={25} />
          </View>
          <View style={styles.settingsCopy}>
            <AppText variant="subheading">Anonymous mode</AppText>
            <AppText color={colors.muted}>Use Anonymous on new posts</AppText>
          </View>
          <Switch
            accessibilityLabel="Use anonymous mode for new posts"
            disabled={savingAnonymous}
            ios_backgroundColor={colors.line}
            onValueChange={(value) => void updateAnonymous(value)}
            thumbColor={colors.white}
            trackColor={{ false: colors.line, true: colors.sage }}
            value={profile?.isAnonymous ?? false}
          />
        </View>
        <SettingsRow
          detail={
            Platform.OS === 'web' && env.isWebCheckoutConfigured
              ? 'Continue to secure web checkout'
              : 'Web checkout setup pending'
          }
          icon="credit-card-outline"
          label="Subscription"
          onPress={Platform.OS === 'web' && env.isWebCheckoutConfigured ? () => void handleSubscription() : undefined}
        />
        <SettingsRow detail="Gentle check-ins only" icon="bell-outline" label="Notifications" />
      </View>

      <View style={styles.support}>
        <AppText variant="heading">Support is always within reach</AppText>
        <SettingsRow
          detail="24/7 mental health support"
          icon="phone-outline"
          label="Call or text 988"
          onPress={() => router.push('/crisis-resources')}
        />
        <SettingsRow
          detail="Postpartum support and referrals"
          icon="account-group-outline"
          label="PSI HelpLine · 1-800-944-4773"
          onPress={() => router.push('/crisis-resources')}
        />
      </View>

      <PressableScale accessibilityRole="button" onPress={() => void handleSignOut()} style={styles.signOut}>
        <AppText color={colors.terracottaDark} variant="bodyMedium">Sign out</AppText>
      </PressableScale>
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginTop: spacing.sm },
  identityCopy: { flex: 1 },
  stage: { marginTop: spacing.xxl },
  week: { marginTop: spacing.xs },
  stageLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -spacing.sm },
  settings: { marginTop: spacing.xl, borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  settingsRow: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  settingsIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: colors.sageSoft,
  },
  terracottaDisc: { backgroundColor: colors.terracottaSoft },
  settingsCopy: { flex: 1 },
  support: { marginTop: spacing.xxl },
  signOut: { minHeight: 52, justifyContent: 'center', marginTop: spacing.md },
});
