import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
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

const CELL_SIZE = 10;
const GAP = 2;
const TOTAL_CELL = CELL_SIZE + GAP;

const MONTH_LABELS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const DAY_LABELS: Record<number, string> = { 1: 'M', 3: 'W', 5: 'F' };

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

  const { grid, monthPositions } = useMemo(() => {
    const start = startOfYear(new Date(targetYear, 0, 1));
    const end = endOfYear(new Date(targetYear, 0, 1));
    const days = eachDayOfInterval({ start, end });

    // Build a grid: columns are weeks, rows are days of week (0=Sun..6=Sat)
    // We'll use Mon=0..Sun=6 layout internally
    const columns: Map<number, { day: number; dateKey: string; color: string }[]> =
      new Map();
    const monthCols: Map<number, number> = new Map();

    let colIndex = 0;
    let prevWeek = -1;

    for (const d of days) {
      // getDay: 0=Sun, 1=Mon..6=Sat; remap so Mon=0..Sun=6
      const jsDay = getDay(d);
      const rowIndex = jsDay === 0 ? 6 : jsDay - 1;
      const weekNum = getWeek(d, { weekStartsOn: 1 });
      const month = d.getMonth();

      // New week = new column
      if (weekNum !== prevWeek) {
        colIndex = columns.size;
        prevWeek = weekNum;
      }

      if (!columns.has(colIndex)) {
        columns.set(colIndex, []);
      }

      const dateKey = format(d, 'yyyy-MM-dd');
      const entry = data[dateKey];
      const color = entry
        ? getHeatmapColor(entry.completed, entry.total)
        : Colors.heatmap[0];

      columns.get(colIndex)!.push({ day: rowIndex, dateKey, color });

      // Track first column for each month
      if (!monthCols.has(month)) {
        monthCols.set(month, colIndex);
      }
    }

    // Convert to array of arrays
    const gridArr: { day: number; color: string }[][] = [];
    for (let c = 0; c < columns.size; c++) {
      gridArr.push(columns.get(c) ?? []);
    }

    return { grid: gridArr, monthPositions: monthCols };
  }, [data, targetYear]);

  const totalWidth = grid.length * TOTAL_CELL;

  const dayLabelColumnWidth = 16;

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ width: totalWidth + dayLabelColumnWidth }}>
          {/* Month labels */}
          <View style={styles.monthRow}>
            <View style={styles.dayLabelColumn} />
            <View style={[styles.monthLabelsInner, { width: totalWidth }]}>
              {MONTH_LABELS.map((label, idx) => {
                const colPos = monthPositions.get(idx) ?? 0;
                return (
                  <Text
                    key={idx}
                    style={[
                      styles.monthLabel,
                      { position: 'absolute', left: colPos * TOTAL_CELL },
                    ]}
                  >
                    {label}
                  </Text>
                );
              })}
            </View>
          </View>

          {/* Grid area */}
          <View style={styles.gridArea}>
            {/* Day labels */}
            <View style={styles.dayLabelColumn}>
              {[0, 1, 2, 3, 4, 5, 6].map((row) => (
                <View key={row} style={styles.dayLabelCell}>
                  {DAY_LABELS[row] != null && (
                    <Text style={styles.dayLabel}>{DAY_LABELS[row]}</Text>
                  )}
                </View>
              ))}
            </View>

            {/* Grid */}
            <View style={styles.gridContainer}>
              {grid.map((column, colIdx) => (
                <View key={colIdx} style={styles.column}>
                  {[0, 1, 2, 3, 4, 5, 6].map((rowIdx) => {
                    const cell = column.find((c) => c.day === rowIdx);
                    return (
                      <View
                        key={rowIdx}
                        style={[
                          styles.cell,
                          {
                            backgroundColor: cell
                              ? cell.color
                              : 'transparent',
                          },
                        ]}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 2,
  },
  monthRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  monthLabelsInner: {
    height: 14,
    position: 'relative',
  },
  monthLabel: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  gridArea: {
    flexDirection: 'row',
  },
  dayLabelColumn: {
    width: 16,
    gap: GAP,
  },
  dayLabelCell: {
    height: CELL_SIZE,
    justifyContent: 'center',
  },
  dayLabel: {
    color: Colors.textMuted,
    fontSize: 9,
  },
  gridContainer: {
    flexDirection: 'row',
    gap: GAP,
  },
  column: {
    gap: GAP,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 2,
  },
});
