import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDaysInMonth,
} from 'date-fns';

import { Colors } from '../constants/colors';

interface HeatmapProps {
  data: Record<string, { completed: number; total: number }>;
  year?: number;
}

const GAP = 2;
const MONTH_LABEL_WIDTH = 28;
const PARENT_HORIZONTAL_PADDING = 40;
const MAX_DAYS = 31;

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getHeatmapColor(completed: number, total: number): string {
  if (total === 0 || completed === 0) return Colors.heatmap[0];
  const pct = (completed / total) * 100;
  if (pct <= 25) return Colors.heatmap[1];
  if (pct <= 50) return Colors.heatmap[2];
  if (pct <= 75) return Colors.heatmap[3];
  return Colors.heatmap[4];
}

export function Heatmap({ data, year }: HeatmapProps) {
  const targetYear = year ?? new Date().getFullYear();
  const { width: screenWidth } = useWindowDimensions();

  const cellSize = useMemo(() => {
    const gridWidth = screenWidth - PARENT_HORIZONTAL_PADDING - MONTH_LABEL_WIDTH;
    return Math.floor((gridWidth - (MAX_DAYS - 1) * GAP) / MAX_DAYS);
  }, [screenWidth]);

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, monthIdx) => {
      const monthStart = startOfMonth(new Date(targetYear, monthIdx, 1));
      const monthEnd = endOfMonth(monthStart);
      const daysInMonth = getDaysInMonth(monthStart);
      const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

      const cells = days.map((d) => {
        const dateKey = format(d, 'yyyy-MM-dd');
        const entry = data[dateKey];
        const color = entry
          ? getHeatmapColor(entry.completed, entry.total)
          : Colors.heatmap[0];
        return { dateKey, color };
      });

      return { label: MONTH_LABELS[monthIdx], cells, daysInMonth };
    });
  }, [data, targetYear]);

  return (
    <View style={styles.container}>
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
}

const styles = StyleSheet.create({
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
    color: Colors.textMuted,
    fontSize: 9,
  },
  cellRow: {
    flexDirection: 'row',
    gap: GAP,
  },
  cell: {
    borderRadius: 2,
  },
});
