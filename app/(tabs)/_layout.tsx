import { useEffect } from 'react';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { BackHandler, Text, StyleSheet } from 'react-native';
import { useColors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

export default function TabLayout() {
  const { t } = useTranslation();
  const colors = useColors();
  const pathname = usePathname();
  const router = useRouter();

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
          height: 85,
          paddingTop: 8,
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
            <Text style={[styles.tabIcon, { color }]} aria-hidden>▦</Text>
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
});
