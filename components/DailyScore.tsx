import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { useTranslation } from 'react-i18next';

import { useColors, type ColorPalette } from '../constants/colors';
import { Fonts } from '../constants/fonts';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface DailyScoreProps {
  completed: number;
  total: number;
  size?: number;
}

const STROKE_WIDTH = 6;

export const DailyScore = React.memo(function DailyScore({
  completed,
  total,
  size = 80,
}: DailyScoreProps) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { t } = useTranslation();

  const radius = (size - STROKE_WIDTH) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? completed / total : 0;

  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, animatedProgress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      accessibilityRole="progressbar"
      accessibilityLabel={t('accessibility.scoreLabel', { completed, total })}
      accessibilityValue={{ min: 0, max: total, now: completed }}
    >
      <Svg width={size} height={size} importantForAccessibility="no">
        {/* Background ring */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.ringBg}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        {/* Foreground (animated) ring */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.ringFill}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.labelContainer} importantForAccessibility="no">
        <Text style={styles.labelText}>
          {completed}/{total}
        </Text>
      </View>
    </View>
  );
});

function makeStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    labelContainer: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    labelText: {
      color: colors.text,
      fontSize: 16,
      fontFamily: Fonts.bold,
    },
  });
}
