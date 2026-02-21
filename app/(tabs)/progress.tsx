import { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  format,
  subDays,
  eachDayOfInterval,
  startOfYear,
  endOfYear,
} from 'date-fns';

import { Colors } from '../../constants/colors';
import { useStore } from '../../store/useStore';
import { Heatmap } from '../../components/Heatmap';
import { WeeklyChart } from '../../components/WeeklyChart';

export default function ProgressScreen() {
  const { t } = useTranslation();
  const days = useStore((s) => s.days);
  const getDayScore = useStore((s) => s.getDayScore);
  const getStreak = useStore((s) => s.getStreak);

  const streak = getStreak();
  const today = new Date();
  const year = today.getFullYear();

  // Best streak calculation
  const bestStreak = useMemo(() => {
    const allDays = eachDayOfInterval({
      start: startOfYear(today),
      end: today,
    });
    let best = 0;
    let current = 0;
    for (const day of allDays) {
      const key = format(day, 'yyyy-MM-dd');
      const score = getDayScore(key);
      if (score.completed > 0) {
        current++;
        best = Math.max(best, current);
      } else {
        current = 0;
      }
    }
    return best;
  }, [days, getDayScore]);

  // Heatmap data
  const heatmapData = useMemo(() => {
    const result: Record<string, { completed: number; total: number }> = {};
    const allDays = eachDayOfInterval({
      start: startOfYear(today),
      end: endOfYear(today),
    });
    for (const day of allDays) {
      const key = format(day, 'yyyy-MM-dd');
      result[key] = getDayScore(key);
    }
    return result;
  }, [days, getDayScore]);

  // Weekly chart data (last 7 days)
  const weeklyData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i);
      const key = format(date, 'yyyy-MM-dd');
      const score = getDayScore(key);
      return {
        date: key,
        score: score.total > 0 ? score.completed / score.total : 0,
      };
    });
  }, [days, getDayScore]);

  // Completion rate this week
  const weeklyRate = useMemo(() => {
    const total = weeklyData.reduce((sum, d) => sum + d.score, 0);
    return Math.round((total / 7) * 100);
  }, [weeklyData]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t('progress.title')}</Text>

        {/* Streak Cards */}
        <View style={styles.streakRow}>
          <View style={styles.streakCard}>
            <Text style={styles.streakNumber}>{streak}</Text>
            <Text style={styles.streakLabel}>
              {t('progress.currentStreak')}
            </Text>
            <Text style={styles.streakUnit}>{t('progress.days')}</Text>
          </View>
          <View style={styles.streakCard}>
            <Text style={styles.streakNumber}>{bestStreak}</Text>
            <Text style={styles.streakLabel}>{t('progress.bestStreak')}</Text>
            <Text style={styles.streakUnit}>{t('progress.days')}</Text>
          </View>
        </View>

        {/* Weekly Chart */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('progress.thisWeek')}</Text>
            <Text style={styles.sectionSubtitle}>
              {t('progress.completionRate', { rate: weeklyRate })}
            </Text>
          </View>
          <WeeklyChart data={weeklyData} />
        </View>

        {/* Annual Heatmap */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('progress.thisYear')} {year}
          </Text>
          <Heatmap data={heatmapData} year={year} />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 20,
  },
  streakRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  streakCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 40,
    fontWeight: '800',
    color: Colors.accent,
  },
  streakLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  streakUnit: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
