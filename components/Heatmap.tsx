import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import {
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  getDay,
  format,
  getWeek,
} from 'date-fns';

import { Colors } from '../constants/colors';

interface HeatmapProps {
  data: Record<string, { completed: number; total: number }>;
  year?: number;
}

const GAP = 2;
const MONTH_LABEL_WIDTH = 22;
const PARENT_HORIZONTAL_PADDING = 40; // 20px each side in progress screen

const MONTH_LABELS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

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
    return Math.floor((gridWidth - 6 * GAP) / 7);
  }, [screenWidth]);

  const { rows, monthRows } = useMemo(() => {
    const start = startOfYear(new Date(targetYear, 0, 1));
    const end = endOfYear(new Date(targetYear, 0, 1));
    const days = eachDayOfInterval({ start, end });

    // Build rows: each row is a week (Mon-Sun), going top to bottom
    const weeks: Map<number, { day: number; dateKey: string; color: string }[]> =
      new Map();
    const monthFirstRow: Map<number, number> = new Map();

    let rowIndex = 0;
    let prevWeek = -1;

    for (const d of days) {
      const jsDay = getDay(d);
      const colIndex = jsDay === 0 ? 6 : jsDay - 1; // Mon=0..Sun=6
      const weekNum = getWeek(d, { weekStartsOn: 1 });
      const month = d.getMonth();

      if (weekNum !== prevWeek) {
        rowIndex = weeks.size;
        prevWeek = weekNum;
      }

      if (!weeks.has(rowIndex)) {
        weeks.set(rowIndex, []);
      }

      const dateKey = format(d, 'yyyy-MM-dd');
      const entry = data[dateKey];
      const color = entry
        ? getHeatmapColor(entry.completed, entry.total)
        : Colors.heatmap[0];

      weeks.get(rowIndex)!.push({ day: colIndex, dateKey, color });

      if (!monthFirstRow.has(month)) {
        monthFirstRow.set(month, rowIndex);
      }
    }

    const rowArr: { day: number; color: string }[][] = [];
    for (let r = 0; r < weeks.size; r++) {
      rowArr.push(weeks.get(r) ?? []);
    }

    return { rows: rowArr, monthRows: monthFirstRow };
  }, [data, targetYear]);

  const totalCell = cellSize + GAP;

  return (
    <View style={styles.container}>
      {/* Day labels header: M T W T F S S */}
      <View style={styles.headerRow}>
        <View style={{ width: MONTH_LABEL_WIDTH }} />
        {DAY_LABELS.map((label, idx) => (
          <View key={idx} style={{ width: cellSize, marginRight: idx < 6 ? GAP : 0 }}>
            <Text style={styles.dayLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Grid rows (one per week) */}
      {rows.map((week, rowIdx) => {
        // Check if this row is the first row of a month
        let monthLabel: string | null = null;
        for (const [month, firstRow] of monthRows) {
          if (firstRow === rowIdx) {
            monthLabel = MONTH_LABELS[month];
            break;
          }
        }

        return (
          <View key={rowIdx} style={styles.weekRow}>
            {/* Month label */}
            <View style={styles.monthLabelCell}>
              {monthLabel && (
                <Text style={styles.monthLabel}>{monthLabel}</Text>
              )}
            </View>

            {/* 7 day cells */}
            {[0, 1, 2, 3, 4, 5, 6].map((colIdx) => {
              const cell = week.find((c) => c.day === colIdx);
              return (
                <View
                  key={colIdx}
                  style={[
                    styles.cell,
                    {
                      width: cellSize,
                      height: cellSize,
                      marginRight: colIdx < 6 ? GAP : 0,
                      backgroundColor: cell ? cell.color : 'transparent',
                    },
                  ]}
                />
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: GAP,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  dayLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthLabelCell: {
    width: MONTH_LABEL_WIDTH,
    justifyContent: 'center',
  },
  monthLabel: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  cell: {
    borderRadius: 2,
  },
});
