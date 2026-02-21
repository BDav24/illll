import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polyline, Circle as SvgCircle } from 'react-native-svg';

import { Colors } from '../constants/colors';

interface WeeklyChartProps {
  data: { date: string; score: number }[];
}

const CHART_HEIGHT = 80;
const CHART_PADDING_TOP = 10;
const CHART_PADDING_BOTTOM = 4;
const DOT_RADIUS = 4;

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function WeeklyChart({ data }: WeeklyChartProps) {
  const displayData = data.length > 0 ? data.slice(-7) : [];

  const points = useMemo(() => {
    if (displayData.length === 0) return [];

    const maxScore = Math.max(...displayData.map((d) => d.score), 1);
    const count = displayData.length;
    const spacing = count > 1 ? 1 / (count - 1) : 0;

    return displayData.map((entry, i) => {
      const xPct = count > 1 ? i * spacing : 0.5;
      const yPct = maxScore > 0 ? entry.score / maxScore : 0;
      return {
        x: xPct,
        y: 1 - yPct, // invert for SVG coords
        score: entry.score,
        date: entry.date,
      };
    });
  }, [displayData]);

  // SVG dimensions based on available width
  const svgWidth = displayData.length * 48;
  const usableHeight = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;

  const svgPoints = points.map((p) => ({
    cx: p.x * (svgWidth - DOT_RADIUS * 2) + DOT_RADIUS,
    cy: p.y * usableHeight + CHART_PADDING_TOP,
    score: p.score,
    date: p.date,
  }));

  const polylinePoints = svgPoints
    .map((p) => `${p.cx},${p.cy}`)
    .join(' ');

  // Derive day labels from dates
  const dayLabels = displayData.map((entry) => {
    const d = new Date(entry.date + 'T00:00:00');
    const jsDay = d.getDay(); // 0=Sun, 1=Mon..6=Sat
    const idx = jsDay === 0 ? 6 : jsDay - 1; // Mon=0..Sun=6
    return DAY_NAMES[idx];
  });

  if (displayData.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text style={styles.emptyText}>No data yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* SVG Chart */}
      <View style={styles.chartWrapper}>
        <Svg width={svgWidth} height={CHART_HEIGHT}>
          {/* Line */}
          {svgPoints.length > 1 && (
            <Polyline
              points={polylinePoints}
              fill="none"
              stroke={Colors.accent}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {/* Dots */}
          {svgPoints.map((pt, i) => (
            <SvgCircle
              key={i}
              cx={pt.cx}
              cy={pt.cy}
              r={DOT_RADIUS}
              fill={Colors.accent}
            />
          ))}
        </Svg>
      </View>

      {/* Score labels */}
      <View style={styles.labelsRow}>
        {svgPoints.map((pt, i) => (
          <View
            key={i}
            style={[styles.labelCell, { width: svgWidth / displayData.length }]}
          >
            <Text style={styles.scoreLabel}>{Math.round(pt.score * 100)}%</Text>
          </View>
        ))}
      </View>

      {/* Day labels */}
      <View style={styles.labelsRow}>
        {dayLabels.map((label, i) => (
          <View
            key={i}
            style={[styles.labelCell, { width: svgWidth / displayData.length }]}
          >
            <Text style={styles.dayLabel}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 120,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  chartWrapper: {
    alignItems: 'center',
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  labelCell: {
    alignItems: 'center',
  },
  scoreLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  dayLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
});
