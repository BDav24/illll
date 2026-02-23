import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { useColors, type ColorPalette } from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { useStore } from '../store/useStore';

interface BreathingTimerProps {
  onComplete: (rounds: number) => void;
  autoStart?: boolean;
}

type Phase = 'idle' | 'inhale' | 'holdIn' | 'exhale' | 'holdOut';

const PHASE_DURATION = 4000; // 4 seconds per phase
const SECONDS_PER_ROUND = 16; // 4 phases × 4 seconds
const MIN_ROUNDS = 1;
const MAX_ROUNDS = 99;
const CIRCLE_SIZE = 200;
const CIRCLE_MIN_SCALE = 0.5;
const CIRCLE_MAX_SCALE = 1.0;

export const BreathingTimer = React.memo(function BreathingTimer({ onComplete, autoStart }: BreathingTimerProps) {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [phase, setPhase] = useState<Phase>('idle');
  const [countdown, setCountdown] = useState(4);
  const [currentRound, setCurrentRound] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const selectedRounds = useStore((s) => s.settings.breathingRounds);
  const setBreathingRounds = useStore((s) => s.setBreathingRounds);

  const totalSeconds = selectedRounds * SECONDS_PER_ROUND;
  const displayMinutes = Math.floor(totalSeconds / 60);
  const displaySeconds = totalSeconds % 60;
  const durationLabel = displayMinutes > 0
    ? t('breathing.duration', { minutes: displayMinutes, seconds: displaySeconds })
    : t('breathing.durationSeconds', { seconds: displaySeconds });

  const scale = useSharedValue(CIRCLE_MIN_SCALE);
  const opacity = useSharedValue(0.4);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roundRef = useRef(0);
  const isRunningRef = useRef(false);
  const selectedRoundsRef = useRef(selectedRounds);
  selectedRoundsRef.current = selectedRounds;
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
            if (nextRound >= selectedRoundsRef.current) {
              // Complete
              setPhase('idle');
              setIsRunning(false);
              isRunningRef.current = false;
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
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    setIsRunning(true);
    setCurrentRound(0);
    roundRef.current = 0;
    scale.value = CIRCLE_MIN_SCALE;
    opacity.value = 0.4;
    startPhase('inhale', 0);
  }, [startPhase, scale, opacity]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
      isRunningRef.current = false;
    };
  }, [clearTimers]);

  // Auto-start for screenshot mode
  useEffect(() => {
    if (autoStart) handleStart();
  }, [autoStart, handleStart]);

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

  const handleDecreaseRounds = useCallback(() => {
    setBreathingRounds(Math.max(MIN_ROUNDS, selectedRounds - 1));
  }, [selectedRounds, setBreathingRounds]);

  const handleIncreaseRounds = useCallback(() => {
    setBreathingRounds(Math.min(MAX_ROUNDS, selectedRounds + 1));
  }, [selectedRounds, setBreathingRounds]);

  return (
    <View style={styles.container}>
      {!isRunning && (
        <View style={styles.roundsSelector}>
          <Text style={styles.roundsLabel}>{t('breathing.rounds')}</Text>
          <View style={styles.stepperRow}>
            <Pressable
              style={[styles.stepperBtn, selectedRounds <= MIN_ROUNDS && styles.stepperBtnDisabled]}
              onPress={handleDecreaseRounds}
              disabled={selectedRounds <= MIN_ROUNDS}
              accessibilityLabel={t('accessibility.decreaseRounds')}
              hitSlop={4}
            >
              <Text style={[styles.stepperText, selectedRounds <= MIN_ROUNDS && styles.stepperTextDisabled]}>-</Text>
            </Pressable>
            <Text style={styles.roundsValue}>{selectedRounds}</Text>
            <Pressable
              style={[styles.stepperBtn, selectedRounds >= MAX_ROUNDS && styles.stepperBtnDisabled]}
              onPress={handleIncreaseRounds}
              disabled={selectedRounds >= MAX_ROUNDS}
              accessibilityLabel={t('accessibility.increaseRounds')}
              hitSlop={4}
            >
              <Text style={[styles.stepperText, selectedRounds >= MAX_ROUNDS && styles.stepperTextDisabled]}>+</Text>
            </Pressable>
          </View>
          <Text style={styles.durationLabel}>{durationLabel}</Text>
        </View>
      )}
      <Pressable onPress={handleStart} style={styles.pressArea} accessibilityRole="button" accessibilityLabel={isRunning ? getPhaseLabel() : t('accessibility.breathingStart')} accessibilityState={{ disabled: isRunning }}>
        <Animated.View style={[styles.circle, animatedCircleStyle]} importantForAccessibility="no" />
        <View style={styles.centerContent} accessibilityLiveRegion="polite">
          {isRunning ? (
            <>
              <Text style={styles.countdown}>{countdown}</Text>
              <Text style={styles.phaseLabel}>{getPhaseLabel()}</Text>
              <Text style={styles.roundLabel} accessibilityLabel={t('accessibility.breathingRound', { current: currentRound + 1, total: selectedRounds })}>
                {currentRound + 1} / {selectedRounds}
              </Text>
            </>
          ) : (
            <Text style={styles.phaseLabel}>{getPhaseLabel()}</Text>
          )}
        </View>
      </Pressable>
    </View>
  );
});

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
    roundsSelector: {
      alignItems: 'center',
      marginBottom: 8,
      gap: 8,
    },
    roundsLabel: {
      fontSize: 12,
      fontFamily: Fonts.medium,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    stepperRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    stepperBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepperBtnDisabled: {
      opacity: 0.3,
    },
    stepperText: {
      fontSize: 20,
      fontFamily: Fonts.semiBold,
      color: colors.text,
      lineHeight: 22,
    },
    stepperTextDisabled: {
      color: colors.textMuted,
    },
    roundsValue: {
      fontSize: 24,
      fontFamily: Fonts.bold,
      color: colors.text,
      minWidth: 36,
      textAlign: 'center',
    },
    durationLabel: {
      fontSize: 13,
      fontFamily: Fonts.regular,
      color: colors.textMuted,
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
