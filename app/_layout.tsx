/*
THESIS: Neova is a shared care ledger, refusing both the social-feed clone and the clinical dashboard.
OWN-WORLD: Cream paper, substantial terracotta and sage fields, Fraunces human moments, Inter controls, fine rules, and a continuous care thread.
STORY: A member arrives, belongs to a small stage-matched circle immediately, shares without performance metrics, learns, and reaches authoritative help quickly.
FIRST VIEWPORT: A restrained Neova masthead gives way to a human title, one functional context label, the thread, and the screen’s primary task at full width.
FORM: Native five-tab operate surface; pinned user direction, seed 57a5d4e9.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
*/
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces/600SemiBold';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useReducedMotion } from 'react-native-reanimated';

import { PwaInstallPrompt } from '@/components/PwaInstallPrompt';
import { CrisisAcknowledgementGuard } from '@/components/CrisisAcknowledgementGuard';
import { AppProvider } from '@/providers/AppProvider';
import { colors } from '@/theme/tokens';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const reducedMotion = useReducedMotion();
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Fraunces_600SemiBold,
  });

  useEffect(() => {
    if (loaded) void SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.cream }}>
      <AppProvider>
        <CrisisAcknowledgementGuard>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.cream },
              animation: reducedMotion ? 'fade' : 'default',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
            <Stack.Screen name="compose" options={{ presentation: 'formSheet', sheetGrabberVisible: true }} />
            <Stack.Screen name="flag-concern" options={{ presentation: 'formSheet', sheetGrabberVisible: true }} />
            <Stack.Screen name="crisis-resources" options={{ presentation: 'formSheet', sheetGrabberVisible: false }} />
            <Stack.Screen name="article/[slug]" />
          </Stack>
        </CrisisAcknowledgementGuard>
        <PwaInstallPrompt />
      </AppProvider>
    </GestureHandlerRootView>
  );
}
