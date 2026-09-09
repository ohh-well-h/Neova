import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { PressableScale } from '@/components/PressableScale';
import { useApp } from '@/providers/AppProvider';
import { colors, elevation, radii, spacing } from '@/theme/tokens';

const PROMPT_SEEN_KEY = 'neova.pwa-install-prompt-seen.v1';

type InstallChoice = { outcome: 'accepted' | 'dismissed'; platform: string };

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallChoice>;
}

type NavigatorWithStandalone = Navigator & { standalone?: boolean };

function isRunningStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    Boolean((window.navigator as NavigatorWithStandalone).standalone)
  );
}

function isIosDevice() {
  return /iPad|iPhone|iPod/.test(window.navigator.userAgent);
}

function hasSeenPrompt() {
  try {
    return window.localStorage.getItem(PROMPT_SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

function rememberPrompt() {
  try {
    window.localStorage.setItem(PROMPT_SEEN_KEY, '1');
  } catch {
    // Storage can be unavailable in private browsing. The prompt stays dismissible.
  }
}

export function PwaInstallPrompt() {
  const { requiresSafetyAcknowledgement, user } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [ios] = useState(() => isIosDevice());

  useEffect(() => {
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => setVisible(false);

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  useEffect(() => {
    if (!user || requiresSafetyAcknowledgement || visible || hasSeenPrompt() || isRunningStandalone()) return;
    if (!ios && !deferredPrompt) return;

    const timeout = window.setTimeout(() => {
      rememberPrompt();
      setVisible(true);
    }, 1800);
    return () => window.clearTimeout(timeout);
  }, [deferredPrompt, ios, requiresSafetyAcknowledgement, user, visible]);

  if (!visible) return null;

  const dismiss = () => setVisible(false);
  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    dismiss();
  };

  return (
    <View pointerEvents="box-none" style={styles.layer}>
      <View accessibilityLabel="Add Neova to your home screen" accessible style={styles.card}>
        <View style={styles.icon}>
          <MaterialCommunityIcons
            color={colors.terracottaDark}
            name={ios ? 'export-variant' : 'cellphone-arrow-down'}
            size={25}
          />
        </View>
        <View style={styles.copy}>
          <AppText variant="subheading">Keep Neova close</AppText>
          <AppText color={colors.charcoalSoft} variant="body">
            {ios
              ? 'In Safari, tap Share, then Add to Home Screen. No pressure - you can keep using Neova here.'
              : 'Add Neova to your home screen for a calmer, app-like way back to your circle.'}
          </AppText>
          <View style={styles.actions}>
            {deferredPrompt ? (
              <PressableScale accessibilityLabel="Add Neova to home screen" onPress={() => void install()} style={styles.primaryAction}>
                <AppText color={colors.white} variant="bodyMedium">Add Neova</AppText>
              </PressableScale>
            ) : null}
            <PressableScale accessibilityLabel="Dismiss home screen suggestion" onPress={dismiss} style={styles.dismissAction}>
              <AppText color={colors.terracottaDark} variant="bodyMedium">{deferredPrompt ? 'Not now' : 'Got it'}</AppText>
            </PressableScale>
          </View>
        </View>
        <PressableScale accessibilityLabel="Dismiss home screen suggestion" onPress={dismiss} style={styles.close}>
          <MaterialCommunityIcons color={colors.charcoalSoft} name="close" size={22} />
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: 92,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 520,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
    paddingRight: 48,
    borderRadius: radii.lg,
    backgroundColor: colors.paper,
    ...elevation,
  },
  icon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: colors.terracottaSoft,
  },
  copy: { flex: 1, gap: spacing.xs },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  primaryAction: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    backgroundColor: colors.terracottaDark,
  },
  dismissAction: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.sm },
  close: {
    position: 'absolute',
    right: spacing.xs,
    top: spacing.xs,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
