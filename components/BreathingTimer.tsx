import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { useColors, type ColorPalette } from '../constants/colors';
import { Fonts } from '../constants/fonts';

interface BreathingTimerProps {
  onComplete: (rounds: number) => void;
}

type Phase = 'idle' | 'inhale' | 'holdIn' | 'exhale' | 'holdOut';

const PHASE_DURATION = 4000; // 4 seconds per phase
const TOTAL_ROUNDS = 4;
const CIRCLE_SIZE = 200;
const CIRCLE_MIN_SCALE = 0.5;
const CIRCLE_MAX_SCALE = 1.0;

export function BreathingTimer({ onComplete }: BreathingTimerProps) {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [phase, setPhase] = useState<Phase>('idle');
  const [countdown, setCountdown] = useState(4);
  const [currentRound, setCurrentRound] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const scale = useSharedValue(CIRCLE_MIN_SCALE);
  const opacity = useSharedValue(0.4);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roundRef = useRef(0);
  const startPhaseRef = useRef<(phase: Phase, round: number) => void>(() => {});

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (phaseTimerRef.current) {
      clearTimeout(phaseTimerRef.current);
      phaseTimerRef.current = null;
    }
  }, []);

  const animatedCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const startPhase = useCallback(
    (newPhase: Phase, round: number) => {
      if (newPhase === 'idle') return;

      setPhase(newPhase);
      setCountdown(4);

      // Animate scale based on phase
      switch (newPhase) {
        case 'inhale':
          scale.value = withTiming(CIRCLE_MAX_SCALE, {
            duration: PHASE_DURATION,
            easing: Easing.inOut(Easing.ease),
          });
          opacity.value = withTiming(0.8, { duration: PHASE_DURATION });
          break;
        case 'holdIn':
          // Stay expanded
          opacity.value = withTiming(0.9, { duration: PHASE_DURATION });
          break;
        case 'exhale':
          scale.value = withTiming(CIRCLE_MIN_SCALE, {
            duration: PHASE_DURATION,
            easing: Easing.inOut(Easing.ease),
          });
          opacity.value = withTiming(0.5, { duration: PHASE_DURATION });
          break;
        case 'holdOut':
          // Stay contracted
          opacity.value = withTiming(0.4, { duration: PHASE_DURATION });
          break;
      }

      // Countdown timer
      let count = 4;
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        count -= 1;
        if (count >= 1) {
          setCountdown(count);
        }
      }, 1000);

      // Schedule next phase
      phaseTimerRef.current = setTimeout(() => {
        if (timerRef.current) clearInterval(timerRef.current);

        let nextPhase: Phase;
        let nextRound = round;

        switch (newPhase) {
          case 'inhale':
            nextPhase = 'holdIn';
            break;
          case 'holdIn':
            nextPhase = 'exhale';
            break;
          case 'exhale':
            nextPhase = 'holdOut';
            break;
          case 'holdOut':
            nextRound = round + 1;
            roundRef.current = nextRound;
            setCurrentRound(nextRound);
            if (nextRound >= TOTAL_ROUNDS) {
              // Complete
              setPhase('idle');
              setIsRunning(false);
              scale.value = withTiming(CIRCLE_MIN_SCALE, { duration: 500 });
              opacity.value = withTiming(0.4, { duration: 500 });
              onComplete(nextRound);
              return;
            }
            nextPhase = 'inhale';
            break;
          default:
            return;
        }

        startPhaseRef.current(nextPhase, nextRound);
      }, PHASE_DURATION);
    },
    [scale, opacity, onComplete],
  );

  startPhaseRef.current = startPhase;

  const handleStart = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
    setCurrentRound(0);
    roundRef.current = 0;
    scale.value = CIRCLE_MIN_SCALE;
    opacity.value = 0.4;
    startPhase('inhale', 0);
  }, [isRunning, startPhase, scale, opacity]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  const getPhaseLabel = (): string => {
    switch (phase) {
      case 'inhale':
        return t('breathing.inhale');
      case 'holdIn':
      case 'holdOut':
        return t('breathing.hold');
      case 'exhale':
        return t('breathing.exhale');
      default:
        return t('breathing.tapToStart');
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handleStart} style={styles.pressArea}>
        <Animated.View style={[styles.circle, animatedCircleStyle]} />
        <View style={styles.centerContent}>
          {isRunning ? (
            <>
              <Text style={styles.countdown}>{countdown}</Text>
              <Text style={styles.phaseLabel}>{getPhaseLabel()}</Text>
              <Text style={styles.roundLabel}>
                {currentRound + 1} / {TOTAL_ROUNDS}
              </Text>
            </>
          ) : (
            <Text style={styles.phaseLabel}>{getPhaseLabel()}</Text>
          )}
        </View>
      </Pressable>
    </View>
  );
}

function makeStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 20,
    },
    pressArea: {
      width: CIRCLE_SIZE,
      height: CIRCLE_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
    },
    circle: {
      position: 'absolute',
      width: CIRCLE_SIZE,
      height: CIRCLE_SIZE,
      borderRadius: CIRCLE_SIZE / 2,
      backgroundColor: colors.breathing,
    },
    centerContent: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },
    countdown: {
      color: colors.text,
      fontSize: 40,
      fontFamily: Fonts.bold,
    },
    phaseLabel: {
      color: colors.text,
      fontSize: 16,
      fontFamily: Fonts.semiBold,
    },
    roundLabel: {
      color: colors.text,
      fontSize: 12,
      fontFamily: Fonts.regular,
      opacity: 0.7,
    },
  });
}
