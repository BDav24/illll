import { useEffect, useState } from 'react';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { BackHandler, Text, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { useStore } from '../../store/useStore';
import { OnboardingHint } from '../../components/OnboardingOverlay';

export default function TabLayout() {
  const { t } = useTranslation();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const router = useRouter();
  const hasSeenOnboarding = useStore((s) => s.settings.hasSeenOnboarding);
  const onboardingHintsUntil = useStore((s) => s.onboardingHintsUntil);
  const [, forceUpdate] = useState(0);
  const hintsVisible = !hasSeenOnboarding || Date.now() < onboardingHintsUntil;

  // Force re-render when linger timer expires
  useEffect(() => {
    if (!onboardingHintsUntil || Date.now() >= onboardingHintsUntil) return;
    const timer = setTimeout(() => forceUpdate((n) => n + 1), onboardingHintsUntil - Date.now());
    return () => clearTimeout(timer);
  }, [onboardingHintsUntil]);

  useEffect(() => {
    if (pathname === '/') return;
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.replace('/');
      return true;
    });
    return () => handler.remove();
  }, [pathname, router]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 80 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: Fonts.semiBold,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.today'),
          tabBarIcon: ({ color }) => (
            <Text style={[styles.tabIcon, { color }]} aria-hidden>◉</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: t('tabs.progress'),
          tabBarIcon: ({ color }) => (
            <View style={styles.progressTabIcon}>
              {hintsVisible && (
                <View style={styles.progressHint}>
                  <OnboardingHint label={t('onboarding.labelProgress')} direction="down" ring="large" />
                </View>
              )}
              <Text style={[styles.tabIcon, { color }]} aria-hidden>▦</Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 22,
  },
  progressTabIcon: {
    alignItems: 'center',
  },
  progressHint: {
    position: 'absolute',
    top: -68,
    bottom: 0,
    alignSelf: 'center',
    zIndex: 10,
  },
});
