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
import BottomSheet, { BottomSheetView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { format } from 'date-fns';
import Svg, { Path } from 'react-native-svg';

import { useColors, type ColorPalette } from '../../constants/colors';
import { useDateLocale } from '../../lib/dateFnsLocale';
import { Fonts } from '../../constants/fonts';
import { HABIT_MAP } from '../../constants/habits';
import {
  useStore,
  getTodayKey,
  emptyDayRecord,
  getDayScore,
  getStreak,
  type HabitId,
  type DayRecord,
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
  const dateLocale = useDateLocale();
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

  const todayRecord = useStore((s) => s.days[currentDateKey]) as DayRecord | undefined;
  const hiddenHabits = useStore((s) => s.settings.hiddenHabits);
  const habitOrder = useStore((s) => s.settings.habitOrder);
  const customHabits = useStore((s) => s.settings.customHabits);
  const habitCriteria = useStore((s) => s.settings.habitCriteria);
  const toggleHabit = useStore((s) => s.toggleHabit);
  const toggleCustomHabit = useStore((s) => s.toggleCustomHabit);
  const updateHabitData = useStore((s) => s.updateHabitData);
  const setHabitCriterion = useStore((s) => s.setHabitCriterion);

  const [isEditingCriterion, setIsEditingCriterion] = useState(false);
  const [criterionDraft, setCriterionDraft] = useState('');
  const [activeCustomHabit, setActiveCustomHabit] = useState<string | null>(null);
  const didResetCriterion = useRef<ReturnType<typeof setTimeout> | null>(null);

  const today = useMemo(
    () => todayRecord ?? emptyDayRecord(currentDateKey),
    [todayRecord, currentDateKey],
  );
  const visibleHabits = useMemo(
    () => habitOrder.filter((id) => !hiddenHabits.includes(id)),
    [habitOrder, hiddenHabits],
  );
  const score = useMemo(
    () => getDayScore(todayRecord, visibleHabits, customHabits),
    [todayRecord, visibleHabits, customHabits],
  );
  const days = useStore((s) => s.days);
  const streak = useMemo(
    () => getStreak(days, visibleHabits, customHabits),
    [days, visibleHabits, customHabits],
  );

  const { greeting, dateStr } = useMemo(() => {
    const hour = new Date().getHours();
    const g =
      hour < 12
        ? t('hub.goodMorning')
        : hour < 18
          ? t('hub.goodAfternoon')
          : t('hub.goodEvening');
    const rawDate = format(new Date(), 'PPPP', { locale: dateLocale })
      .replace(/[,\s]*\d{4}[年년]?[,\s]*/g, ' ')
      .trim();
    const d = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);
    return { greeting: g, dateStr: d };
  }, [currentDateKey, dateLocale, t]);

  const getDisplayedCriterion = useCallback(
    (habitId: string) => {
      return habitCriteria[habitId] || t(`habits.${habitId}.criterion`);
    },
    [habitCriteria, t],
  );

  const handleStartEditCriterion = useCallback(() => {
    const habitId = activeHabit ?? activeCustomHabit;
    if (!habitId) return;
    if (didResetCriterion.current) clearTimeout(didResetCriterion.current);
    didResetCriterion.current = null;
    setCriterionDraft(habitCriteria[habitId] || (activeHabit ? t(`habits.${activeHabit}.criterion`) : ''));
    setIsEditingCriterion(true);
  }, [activeHabit, activeCustomHabit, habitCriteria, t]);

  const handleSubmitCriterion = useCallback(() => {
    const habitId = activeHabit ?? activeCustomHabit;
    if (!habitId) return;
    const trimmed = criterionDraft.trim();
    if (trimmed) {
      setHabitCriterion(habitId, trimmed);
    }
    setIsEditingCriterion(false);
  }, [activeHabit, activeCustomHabit, criterionDraft, setHabitCriterion]);

  const handleBlurCriterion = useCallback(() => {
    // Delay so a "Reset to default" press can fire before we save
    didResetCriterion.current = setTimeout(() => {
      handleSubmitCriterion();
    }, 150);
  }, [handleSubmitCriterion]);

  const handleResetCriterion = useCallback(() => {
    if (didResetCriterion.current) clearTimeout(didResetCriterion.current);
    const habitId = activeHabit ?? activeCustomHabit;
    if (!habitId) return;
    setHabitCriterion(habitId, '');
    setIsEditingCriterion(false);
  }, [activeHabit, activeCustomHabit, setHabitCriterion]);

  const handleHabitPress = useCallback(
    (id: HabitId) => {
      setActiveCustomHabit(null);
      setActiveHabit(id);
      setIsEditingCriterion(false);
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

  const handleCustomHabitPress = useCallback(
    (id: string) => {
      setActiveHabit(null);
      setActiveCustomHabit(id);
      setIsEditingCriterion(false);
      bottomSheetRef.current?.expand();
    },
    [],
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
            <Text style={styles.greeting} accessibilityRole="header">{greeting}</Text>
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
            accessibilityRole="button"
            accessibilityLabel={t('accessibility.settings')}
          >
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" importantForAccessibility="no">
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
                onPress={handleHabitPress}
                onInfoPress={handleInfoPress}
                onCheckboxPress={handleCheckboxPress}
              />
            );
          })}
        </View>

        {/* Custom Habits */}
        {customHabits.length > 0 && (
          <View style={styles.customHabitsSection}>
            {customHabits.map((ch) => (
              <CustomHabitCard
                key={ch.id}
                id={ch.id}
                text={ch.text}
                completed={today.habits[ch.id]?.completed ?? false}
                onPress={handleCustomHabitPress}
                onCheckboxPress={toggleCustomHabit}
                criterion={habitCriteria[ch.id]}
              />
            ))}
          </View>
        )}

        {/* All done message */}
        {score.total > 0 && score.completed === score.total && (
          <View style={styles.allDone} accessibilityRole="alert" accessibilityLiveRegion="polite">
            <Text style={styles.allDoneText}>{t('hub.allDone')}</Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Sheet for habit quick actions */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.sheetHandle}
        onClose={() => {
          setActiveHabit(null);
          setActiveCustomHabit(null);
          setIsEditingCriterion(false);
        }}
      >
        <BottomSheetView style={styles.sheetContent}>
          {activeHabit && (
            <>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetIcon} importantForAccessibility="no">
                  {HABIT_MAP[activeHabit].icon}
                </Text>
                <Text style={styles.sheetTitle} accessibilityRole="header">
                  {t(`habits.${activeHabit}.name`)}
                </Text>
              </View>

              <View style={styles.sheetRecoCard}>
                <Text style={styles.sheetRecoLabel}>{t('article.recommendation')}</Text>
                <Text style={styles.sheetRecoText}>
                  {t(`habits.${activeHabit}.recommendation`)}
                </Text>
              </View>

              {isEditingCriterion ? (
                <View style={styles.criterionCard}>
                  <Text style={styles.sheetRecoLabel}>{t('criteria.myGoal')}</Text>
                  <BottomSheetTextInput
                    style={styles.criterionInput}
                    value={criterionDraft}
                    onChangeText={setCriterionDraft}
                    onSubmitEditing={handleSubmitCriterion}
                    onBlur={handleBlurCriterion}
                    autoFocus
                    returnKeyType="done"
                    placeholder={t('criteria.placeholder')}
                    placeholderTextColor={colors.textMuted}
                    accessibilityLabel={t('criteria.placeholder')}
                  />
                  <Pressable onPress={handleResetCriterion} accessibilityRole="button">
                    <Text style={styles.criterionReset}>{t('criteria.reset')}</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  style={styles.criterionCard}
                  onPress={handleStartEditCriterion}
                  accessibilityRole="button"
                  accessibilityLabel={`${t('criteria.myGoal')}: ${getDisplayedCriterion(activeHabit)}`}
                >
                  <View style={styles.criterionHeader}>
                    <Text style={styles.sheetRecoLabel}>{t('criteria.myGoal')}</Text>
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                      <Path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z" stroke={colors.textMuted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </View>
                  <Text style={styles.sheetRecoText}>
                    {getDisplayedCriterion(activeHabit)}
                  </Text>
                </Pressable>
              )}

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
                    accessibilityRole="button"
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
                accessibilityRole="link"
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

          {activeCustomHabit && (() => {
            const ch = customHabits.find((c) => c.id === activeCustomHabit);
            if (!ch) return null;
            return (
              <>
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle} accessibilityRole="header">
                    {ch.text}
                  </Text>
                </View>

                {isEditingCriterion ? (
                  <View style={styles.criterionCard}>
                    <Text style={styles.sheetRecoLabel}>{t('criteria.myGoal')}</Text>
                    <BottomSheetTextInput
                      style={styles.criterionInput}
                      value={criterionDraft}
                      onChangeText={setCriterionDraft}
                      onSubmitEditing={handleSubmitCriterion}
                      onBlur={handleBlurCriterion}
                      autoFocus
                      returnKeyType="done"
                      placeholder={t('criteria.placeholder')}
                      placeholderTextColor={colors.textMuted}
                      accessibilityLabel={t('criteria.placeholder')}
                    />
                    <Pressable onPress={handleResetCriterion} accessibilityRole="button">
                      <Text style={styles.criterionReset}>{t('criteria.reset')}</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    style={styles.criterionCard}
                    onPress={handleStartEditCriterion}
                    accessibilityRole="button"
                    accessibilityLabel={`${t('criteria.myGoal')}: ${habitCriteria[activeCustomHabit] || t('criteria.placeholder')}`}
                  >
                    <View style={styles.criterionHeader}>
                      <Text style={styles.sheetRecoLabel}>{t('criteria.myGoal')}</Text>
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                      <Path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z" stroke={colors.textMuted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                    </View>
                    <Text style={[styles.sheetRecoText, !habitCriteria[activeCustomHabit] && styles.criterionPlaceholder]}>
                      {habitCriteria[activeCustomHabit] || t('criteria.placeholder')}
                    </Text>
                  </Pressable>
                )}

                <View style={styles.sheetBody}>
                  <Pressable
                    style={styles.sheetActionBtn}
                    accessibilityRole="button"
                    onPress={() => {
                      toggleCustomHabit(activeCustomHabit);
                      bottomSheetRef.current?.close();
                    }}
                  >
                    <Text style={styles.sheetActionText}>
                      {today.habits[activeCustomHabit]?.completed
                        ? t('hub.tapToUndo')
                        : t('hub.tapToComplete')}
                    </Text>
                  </Pressable>
                </View>
              </>
            );
          })()}
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
      padding: 11,
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
    sheetRecoCard: {
      backgroundColor: colors.bg,
      borderRadius: 12,
      padding: 16,
      borderLeftWidth: 3,
      borderLeftColor: colors.success,
      marginBottom: 12,
    },
    criterionCard: {
      backgroundColor: colors.bg,
      borderRadius: 12,
      padding: 16,
      borderLeftWidth: 3,
      borderLeftColor: colors.accent,
      marginBottom: 12,
    },
    criterionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    criterionInput: {
      fontSize: 14,
      fontFamily: Fonts.regular,
      color: colors.text,
      borderBottomWidth: 1,
      borderBottomColor: colors.accent,
      paddingVertical: 4,
      marginBottom: 8,
    },
    criterionReset: {
      fontSize: 13,
      fontFamily: Fonts.medium,
      color: colors.accent,
      textAlign: 'right',
    },
    criterionPlaceholder: {
      color: colors.textMuted,
      fontStyle: 'italic',
    },
    sheetRecoLabel: {
      fontSize: 11,
      fontFamily: Fonts.bold,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 6,
    },
    sheetRecoText: {
      fontSize: 14,
      fontFamily: Fonts.regular,
      color: colors.text,
      lineHeight: 21,
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
    bottomSpacer: {
      height: 40,
    },
  });
}
