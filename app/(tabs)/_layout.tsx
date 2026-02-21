import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.today'),
          tabBarIcon: ({ color }) => (
            <Text style={[styles.tabIcon, { color }]}>◉</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: t('tabs.progress'),
          tabBarIcon: ({ color }) => (
            <Text style={[styles.tabIcon, { color }]}>▦</Text>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    height: 85,
    paddingTop: 8,
  },
  tabIcon: {
    fontSize: 22,
  },
  tabLabel: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
  },
});
