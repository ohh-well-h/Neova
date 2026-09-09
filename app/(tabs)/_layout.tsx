import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Redirect, Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { Platform } from 'react-native';

import { useApp } from '@/providers/AppProvider';
import { colors, fonts } from '@/theme/tokens';

const tabIcon = (name: React.ComponentProps<typeof MaterialCommunityIcons>['name']) =>
  function TabIcon({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) {
    const resolved = focused && name === 'home-outline' ? 'home' : name;
    return <MaterialCommunityIcons color={color} name={resolved} size={size} />;
  };

export default function TabLayout() {
  const { loading, user, hasCompletedIntake, requiresSafetyAcknowledgement, startupError } = useApp();
  if (!loading && startupError) return <Redirect href="/" />;
  if (!loading && !user) return <Redirect href="/(auth)/sign-in" />;
  if (!loading && user && !hasCompletedIntake) return <Redirect href="/(onboarding)/intake" />;
  if (!loading && requiresSafetyAcknowledgement) {
    return <Redirect href={{ pathname: '/crisis-resources', params: { required: '1' } }} />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: 'none',
        sceneStyle: { backgroundColor: colors.cream },
        tabBarActiveTintColor: colors.terracottaDark,
        tabBarInactiveTintColor: colors.charcoalSoft,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: { fontFamily: fonts.body, fontSize: 12 },
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 84 : 68,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          borderTopColor: colors.line,
          borderTopWidth: 1,
          backgroundColor: colors.cream,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: tabIcon('home-outline') }} />
      <Tabs.Screen name="circle" options={{ title: 'Circle', tabBarIcon: tabIcon('account-group-outline') }} />
      <Tabs.Screen name="learn" options={{ title: 'Learn', tabBarIcon: tabIcon('book-open-page-variant-outline') }} />
      <Tabs.Screen name="impact" options={{ title: 'Impact', tabBarIcon: tabIcon('leaf') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tabIcon('account-outline') }} />
    </Tabs>
  );
}
