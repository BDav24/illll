import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDaysInMonth,
} from 'date-fns';

import { useTranslation } from 'react-i18next';

import { useColors, type ColorPalette } from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { useDateLocale } from '../lib/dateFnsLocale';

interface HeatmapProps {
  data: Record<string, { completed: number; total: number }>;
  year?: number;
}

const GAP = 2;
const MONTH_LABEL_WIDTH = 28;
const PARENT_HORIZONTAL_PADDING = 40;
const MAX_DAYS = 31;

function getHeatmapColor(completed: number, total: number, heatmap: string[]): string {
  if (total === 0 || completed === 0) return heatmap[0];
  const pct = (completed / total) * 100;
  if (pct <= 25) return heatmap[1];
  if (pct <= 50) return heatmap[2];
  if (pct <= 75) return heatmap[3];
  return heatmap[4];
}

export const Heatmap = React.memo(function Heatmap({ data, year }: HeatmapProps) {
  const colors = useColors();
  const dateLocale = useDateLocale();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { t } = useTranslation();

  const targetYear = year ?? new Date().getFullYear();
  const { width: screenWidth } = useWindowDimensions();

  const cellSize = useMemo(() => {
    const gridWidth = screenWidth - PARENT_HORIZONTAL_PADDING - MONTH_LABEL_WIDTH;
    return Math.floor((gridWidth - (MAX_DAYS - 1) * GAP) / MAX_DAYS);
  }, [screenWidth]);

  const months = useMemo(() => {
    // Rotate months so current month is second-to-last row (easy to see near bottom)
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-based
    const startMonth = (currentMonth + 2) % 12;

    return Array.from({ length: 12 }, (_, i) => {
      const monthIdx = (startMonth + i) % 12;
      // Determine year: months after currentMonth that wrap around are from targetYear-1
      const monthYear = monthIdx > currentMonth ? targetYear - 1 : targetYear;
      const monthStart = startOfMonth(new Date(monthYear, monthIdx, 1));
      const monthEnd = endOfMonth(monthStart);
      const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

      const cells = days.map((d) => {
        const dateKey = format(d, 'yyyy-MM-dd');
        const entry = data[dateKey];
        const color = entry
          ? getHeatmapColor(entry.completed, entry.total, colors.heatmap)
          : colors.heatmap[0];
        return { dateKey, color };
      });

      const label = format(monthStart, 'MMM', { locale: dateLocale });
      return { label, cells, daysInMonth: getDaysInMonth(monthStart) };
    });
  }, [data, targetYear, colors.heatmap, dateLocale]);

  return (
    <View style={styles.container} accessible={true} accessibilityRole="image" accessibilityLabel={t('accessibility.heatmapLabel')}>
      {months.map((month, idx) => (
        <View key={idx} style={styles.monthRow}>
          <View style={styles.monthLabelCell}>
            <Text style={styles.monthLabel}>{month.label}</Text>
          </View>
          <View style={styles.cellRow}>
            {month.cells.map((cell, dayIdx) => (
              <View
                key={dayIdx}
                style={[
                  styles.cell,
                  {
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: cell.color,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
});

function makeStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: {
      gap: GAP,
    },
    monthRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    monthLabelCell: {
      width: MONTH_LABEL_WIDTH,
      justifyContent: 'center',
    },
    monthLabel: {
      color: colors.textMuted,
      fontSize: 9,
      fontFamily: Fonts.regular,
    },
    cellRow: {
      flexDirection: 'row',
      gap: GAP,
    },
    cell: {
      borderRadius: 2,
    },
  });
}
