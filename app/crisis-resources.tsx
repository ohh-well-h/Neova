import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { BackHandler, Platform, StyleSheet, View } from 'react-native';

import { ActionButton } from '@/components/ActionButton';
import { AppText } from '@/components/AppText';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { useApp } from '@/providers/AppProvider';
import { showAlert } from '@/services/alerts';
import { CRISIS_RESOURCES_ROOT_ID } from '@/services/crisisNavigation';
import { openResource } from '@/services/resources';
import { colors, radii, spacing } from '@/theme/tokens';

function ResourceAction({ icon, title, detail, onPress }: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  detail: string;
  onPress: () => void;
}) {
  return (
    <PressableScale accessibilityLabel={`${title}. ${detail}`} onPress={onPress} style={styles.resource}>
      <View style={styles.icon}>
        <MaterialCommunityIcons color={colors.white} name={icon} size={25} />
      </View>
      <View style={styles.resourceCopy}>
        <AppText variant="subheading">{title}</AppText>
        <AppText variant="caption" color={colors.charcoalSoft}>{detail}</AppText>
      </View>
      <MaterialCommunityIcons color={colors.charcoal} name="chevron-right" size={24} />
    </PressableScale>
  );
}

export default function CrisisResourcesScreen() {
  const { acknowledgeSafetyResources, requiresSafetyAcknowledgement, signOut } = useApp();
  const params = useLocalSearchParams<{ required?: string }>();
  const required = requiresSafetyAcknowledgement || params.required === '1';
  const [acknowledging, setAcknowledging] = useState(false);

  useEffect(() => {
    if (!required || Platform.OS === 'web') return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, [required]);

  const close = async () => {
    if (!required) {
      router.back();
      return;
    }
    setAcknowledging(true);
    try {
      await acknowledgeSafetyResources();
      router.replace('/(tabs)');
    } catch (error) {
      showAlert(
        'Keep this screen open',
        error instanceof Error ? error.message : 'The acknowledgement could not be saved. Try again.',
      );
    } finally {
      setAcknowledging(false);
    }
  };

  const logout = async () => {
    try {
      await signOut();
      router.replace('/(auth)/sign-in');
    } catch (error) {
      showAlert('Could not sign out', error instanceof Error ? error.message : 'Try again shortly.');
    }
  };

  return (
    <Screen contentStyle={styles.content}>
      <View nativeID={CRISIS_RESOURCES_ROOT_ID}>
        <Stack.Screen options={{ gestureEnabled: !required }} />
        <View style={styles.topRow}>
          <AppText variant="display">Support resources</AppText>
          {!required ? <ActionButton label="Close" tone="text" onPress={() => void close()} /> : null}
        </View>
        {required ? (
          <View style={styles.notice}>
            <AppText variant="heading" color={colors.white}>A safety-language marker was matched.</AppText>
            <AppText color={colors.white}>
              Your post was shared as written and was not publicly marked. Neova does not provide counseling. Please review these human support options.
            </AppText>
          </View>
        ) : (
          <AppText color={colors.charcoalSoft} style={styles.intro}>
            These US resources are available whether you are in crisis, looking for postpartum support, or helping someone else.
          </AppText>
        )}

        <View style={styles.resources}>
          <ResourceAction
            detail="Free, confidential emotional support, 24/7"
            icon="phone"
            title="Call 988"
            onPress={() => void openResource('tel:988', 'call 988')}
          />
          <ResourceAction
            detail="Start a confidential text conversation"
            icon="message-text-outline"
            title="Text 988"
            onPress={() => void openResource('sms:988', 'text 988')}
          />
          <ResourceAction
            detail="Postpartum support and referrals; not an emergency line"
            icon="account-group-outline"
            title="PSI HelpLine · 1-800-944-4773"
            onPress={() => void openResource('tel:18009444773', 'call the PSI HelpLine')}
          />
          <ResourceAction
            detail="If there is immediate physical danger"
            icon="alert-outline"
            title="Call 911"
            onPress={() => void openResource('tel:911', 'call 911')}
          />
        </View>

        {required ? (
          <View style={styles.acknowledge}>
            <AppText variant="caption" color={colors.charcoalSoft}>
              This screen stays open until you acknowledge that you have seen the resources.
            </AppText>
            <ActionButton
              label="I have seen these resources"
              loading={acknowledging}
              onPress={() => void close()}
            />
            <ActionButton label="Sign out" tone="text" onPress={() => void logout()} />
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.xl },
  topRow: { flexDirection: 'row', alignItems: 'flex-start' },
  intro: { marginTop: spacing.xl },
  notice: { marginTop: spacing.xl, gap: spacing.md, padding: spacing.xl, borderRadius: radii.lg, backgroundColor: colors.terracottaDark },
  resources: { marginTop: spacing.xxl, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  resource: { minHeight: 82, flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  icon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sageDark },
  resourceCopy: { flex: 1, gap: spacing.xs },
  acknowledge: { marginTop: spacing.xxxl, gap: spacing.lg },
});
