import { useCallback, useRef, useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { format } from 'date-fns';
import Svg, { Path } from 'react-native-svg';

import { useColors, type ColorPalette } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { HABIT_MAP } from '../../constants/habits';
import {
  useStore,
  getTodayKey,
  emptyDayRecord,
  getVisibleHabits,
  getDayScore,
  getStreak,
  type HabitId,
} from '../../store/useStore';
import { DailyScore } from '../../components/DailyScore';
import { StreakBadge } from '../../components/StreakBadge';
import { HabitCard } from '../../components/HabitCard';
import { CustomHabitCard } from '../../components/CustomHabitCard';
import { BreathingTimer } from '../../components/BreathingTimer';

export default function DailyHub() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [activeHabit, setActiveHabit] = useState<HabitId | null>(null);

  const [currentDateKey, setCurrentDateKey] = useState(getTodayKey());

  useEffect(() => {
    const interval = setInterval(() => {
      const newKey = getTodayKey();
      setCurrentDateKey((prev) => (prev !== newKey ? newKey : prev));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const todayKey = currentDateKey;
  const days = useStore((s) => s.days);
  const settings = useStore((s) => s.settings);
  const today = days[todayKey] ?? emptyDayRecord(todayKey);
  const visibleHabits = useMemo(() => getVisibleHabits(settings), [settings]);
  const score = useMemo(() => getDayScore(days[todayKey], visibleHabits, settings.customHabits), [days, todayKey, visibleHabits, settings.customHabits]);
  const streak = useMemo(() => getStreak(days, visibleHabits, settings.customHabits), [days, visibleHabits, settings.customHabits]);
  const toggleHabit = useStore((s) => s.toggleHabit);
  const toggleCustomHabit = useStore((s) => s.toggleCustomHabit);
  const updateHabitData = useStore((s) => s.updateHabitData);

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? t('hub.goodMorning')
      : hour < 18
        ? t('hub.goodAfternoon')
        : t('hub.goodEvening');

  const dateStr = format(new Date(), 'EEEE, MMMM d');

  const handleHabitPress = useCallback(
    (id: HabitId) => {
      setActiveHabit(id);
      bottomSheetRef.current?.expand();
    },
    [],
  );

  const handleInfoPress = useCallback(
    (id: HabitId) => {
      router.push(`/habit/${id}`);
    },
    [router],
  );

  const handleCheckboxPress = useCallback(
    (id: HabitId) => {
      toggleHabit(id);
    },
    [toggleHabit],
  );

  const handleBreathingComplete = useCallback(
    (rounds: number) => {
      updateHabitData('breathing', { duration: rounds * 16, rounds });
      bottomSheetRef.current?.close();
      setActiveHabit(null);
    },
    [updateHabitData],
  );

  const snapPoints = useMemo(() => ['50%', '75%'], []);

  const habitEntries = today.habits;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.date}>{dateStr}</Text>
          </View>
          <View style={styles.headerRight}>
            <DailyScore
              completed={score.completed}
              total={score.total}
              size={64}
            />
          </View>
        </View>

        {/* Streak */}
        <View style={styles.streakRow}>
          <StreakBadge count={streak} />
          <Pressable
            onPress={() => router.push('/settings')}
            style={styles.settingsBtn}
          >
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                stroke={colors.textSecondary}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
                stroke={colors.textSecondary}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>
        </View>

        {/* Welcome hint */}
        {score.completed === 0 && score.total > 0 && (
          <Text style={styles.welcomeHint}>{t('hub.welcomeHint')}</Text>
        )}

        {/* Habit Cards */}
        <View style={styles.habitsSection}>
          {visibleHabits.map((id) => {
            const entry = habitEntries[id];
            return (
              <HabitCard
                key={id}
                habitId={id}
                completed={entry?.completed ?? false}
                onPress={() => handleHabitPress(id)}
                onInfoPress={() => handleInfoPress(id)}
                onCheckboxPress={() => handleCheckboxPress(id)}
              />
            );
          })}
        </View>

        {/* Custom Habits */}
        {settings.customHabits.length > 0 && (
          <View style={styles.customHabitsSection}>
            {settings.customHabits.map((ch) => (
              <CustomHabitCard
                key={ch.id}
                text={ch.text}
                completed={today.habits[ch.id]?.completed ?? false}
                onPress={() => toggleCustomHabit(ch.id)}
              />
            ))}
          </View>
        )}

        {/* All done message */}
        {score.total > 0 && score.completed === score.total && (
          <View style={styles.allDone}>
            <Text style={styles.allDoneText}>{t('hub.allDone')}</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Sheet for habit quick actions */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.sheetHandle}
        onClose={() => setActiveHabit(null)}
      >
        <BottomSheetView style={styles.sheetContent}>
          {activeHabit && (
            <>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetIcon}>
                  {HABIT_MAP[activeHabit].icon}
                </Text>
                <Text style={styles.sheetTitle}>
                  {t(`habits.${activeHabit}.name`)}
                </Text>
              </View>

              {activeHabit === 'breathing' && (
                <BreathingTimer onComplete={handleBreathingComplete} />
              )}

              {activeHabit !== 'breathing' && (
                <View style={styles.sheetBody}>
                  <Text style={styles.sheetOneLiner}>
                    {t(`habits.${activeHabit}.oneLiner`)}
                  </Text>
                  <Pressable
                    style={styles.sheetActionBtn}
                    onPress={() => {
                      toggleHabit(activeHabit);
                      bottomSheetRef.current?.close();
                    }}
                  >
                    <Text style={styles.sheetActionText}>
                      {t(`habits.${activeHabit}.action`)}
                    </Text>
                  </Pressable>
                </View>
              )}

              <Pressable
                style={styles.whyBtn}
                onPress={() => {
                  bottomSheetRef.current?.close();
                  router.push(`/habit/${activeHabit}`);
                }}
              >
                <Text style={styles.whyBtnText}>
                  {t('article.whyTitle', {
                    habit: t(`habits.${activeHabit}.name`),
                  })}
                </Text>
              </Pressable>
            </>
          )}
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
}

function makeStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 8,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    headerLeft: {
      flex: 1,
    },
    headerRight: {
      marginLeft: 16,
    },
    greeting: {
      fontSize: 28,
      fontFamily: Fonts.bold,
      color: colors.text,
    },
    date: {
      fontSize: 15,
      fontFamily: Fonts.regular,
      color: colors.textSecondary,
      marginTop: 2,
    },
    streakRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      marginTop: 8,
    },
    settingsBtn: {
      padding: 8,
    },
    welcomeHint: {
      color: colors.textMuted,
      fontSize: 14,
      fontFamily: Fonts.regular,
      textAlign: 'center',
      marginBottom: 16,
    },
    habitsSection: {
      gap: 12,
      marginBottom: 16,
    },
    customHabitsSection: {
      gap: 12,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: Fonts.semiBold,
      color: colors.text,
      marginBottom: 12,
    },
    allDone: {
      alignItems: 'center',
      paddingVertical: 24,
    },
    allDoneText: {
      fontSize: 18,
      fontFamily: Fonts.semiBold,
      color: colors.success,
    },
    sheetBg: {
      backgroundColor: colors.surface,
    },
    sheetHandle: {
      backgroundColor: colors.textMuted,
    },
    sheetContent: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 8,
    },
    sheetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 20,
    },
    sheetIcon: {
      fontSize: 32,
    },
    sheetTitle: {
      fontSize: 24,
      fontFamily: Fonts.bold,
      color: colors.text,
    },
    sheetBody: {
      gap: 16,
    },
    sheetOneLiner: {
      fontSize: 16,
      fontFamily: Fonts.regular,
      color: colors.textSecondary,
      lineHeight: 24,
    },
    sheetActionBtn: {
      backgroundColor: colors.accent,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: 'center',
    },
    sheetActionText: {
      color: colors.checkmark,
      fontSize: 16,
      fontFamily: Fonts.semiBold,
    },
    whyBtn: {
      marginTop: 20,
      paddingVertical: 12,
      alignItems: 'center',
    },
    whyBtnText: {
      color: colors.accent,
      fontSize: 15,
      fontFamily: Fonts.medium,
    },
  });
}
