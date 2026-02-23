import { useCallback, useEffect, useMemo, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, useColorScheme } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
} from '@expo-google-fonts/quicksand';
import { format } from 'date-fns';
import '../lib/i18n';
import { loadLanguage } from '../lib/i18n';
import { useColors } from '../constants/colors';
import { useStore, type HabitId, type HabitEntry, type DayRecord } from '../store/useStore';
import { syncNotifications } from '../lib/notifications';
import { screenshotConfig } from '../lib/screenshotMode';

SplashScreen.preventAutoHideAsync();

function buildScreenshotDays(scene: string): Record<string, DayRecord> {
  const ALL_HABITS: HabitId[] = ['breathing', 'light', 'food', 'sleep', 'exercise', 'gratitude'];
  const days: Record<string, DayRecord> = {};
  const now = new Date();

  // 36 past days fully completed (gives 35-day streak + today)
  for (let i = 1; i <= 36; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = format(d, 'yyyy-MM-dd');
    const habits: Record<string, HabitEntry> = {};
    for (const id of ALL_HABITS) {
      habits[id] = { completed: true, timestamp: d.getTime() };
    }
    days[key] = { date: key, habits };
  }

  // Today: 3/6 for hub-progress, 6/6 for everything else
  const todayKey = format(now, 'yyyy-MM-dd');
  const todayHabits: Record<string, HabitEntry> = {};
  const completedToday = scene === 'hub-progress' ? 3 : ALL_HABITS.length;
  for (let i = 0; i < ALL_HABITS.length; i++) {
    todayHabits[ALL_HABITS[i]] = {
      completed: i < completedToday,
      timestamp: now.getTime(),
    };
  }
  days[todayKey] = { date: todayKey, habits: todayHabits };

  return days;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  const [screenshotReady, setScreenshotReady] = useState(!screenshotConfig.enabled);

  useEffect(() => {
    if (!screenshotConfig.enabled) return;
    const { lang, scene } = screenshotConfig;

    // Seed mock data into store
    useStore.setState((state) => ({
      days: buildScreenshotDays(scene),
      settings: {
        ...state.settings,
        colorScheme: 'dark' as const,
        language: lang,
        hiddenHabits: [],
      },
    }));

    // Load language then signal ready
    loadLanguage(lang).then(() => setScreenshotReady(true));
  }, []);

  const colors = useColors();
  const colorScheme = useStore((s) => s.settings.colorScheme);
  const notifications = useStore((s) => s.settings.notifications) ?? [];
  const systemScheme = useColorScheme();
  const resolved = colorScheme === 'auto' ? (systemScheme ?? 'light') : colorScheme;

  // Sync scheduled OS notifications whenever the user's list changes
  useEffect(() => {
    syncNotifications(notifications);
  }, [notifications]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: { flex: 1, backgroundColor: colors.bg },
      }),
    [colors.bg],
  );

  const onLayoutRootView = useCallback(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded || !screenshotReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root} onLayout={onLayoutRootView}>
      <StatusBar style={resolved === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="habit/[id]"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="reminders"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
