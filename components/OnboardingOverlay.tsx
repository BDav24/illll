import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  Animated as RNAnimated,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';
import { useColors, type ColorPalette } from '../constants/colors';
import { Fonts } from '../constants/fonts';

const STEPS = [
  { key: 'step1', emoji: '🎯' },
  { key: 'step2', emoji: '🔔' },
  { key: 'step3', emoji: '📈' },
] as const;

const RING_SIZE = 48;
const PROGRESS_RING_SIZE = 80;
const HIGHLIGHT_COLOR = '#FF3B30';
const LINGER_DURATION = 10_000;
const FADE_DURATION = 600;
const ARROW_H = 28;

interface Position {
  x: number;
  y: number;
}

// Global trigger for lingering highlights (rendered at root level)
type LingerListener = (
  settings: Position | null,
  progress: Position | null,
  habits: Position | null,
) => void;
let lingerListener: LingerListener | null = null;

function triggerLinger(
  settings: Position | null,
  progress: Position | null,
  habits: Position | null,
) {
  lingerListener?.(settings, progress, habits);
}

function Highlights({
  settingsPosition,
  progressTabPosition,
  habitsPosition,
}: {
  settingsPosition: Position | null;
  progressTabPosition: Position | null;
  habitsPosition: Position | null;
}) {
  const { t } = useTranslation();

  return (
    <>
      {/* Settings: circle + arrow pointing UP at it + label below */}
      {settingsPosition && (
        <>
          <View
            style={[
              staticStyles.ring,
              {
                left: settingsPosition.x - RING_SIZE / 2,
                top: settingsPosition.y - RING_SIZE / 2,
              },
            ]}
          />
          <View
            style={[
              staticStyles.arrowLabelGroup,
              {
                left: settingsPosition.x - 60,
                top: settingsPosition.y + RING_SIZE / 2 + 4,
                width: 120,
              },
            ]}
          >
            <Svg width={24} height={ARROW_H} viewBox="0 0 24 28">
              <Path
                d="M12 28 L12 8 M6 14 L12 6 L18 14"
                stroke={HIGHLIGHT_COLOR}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
            <Text style={staticStyles.label}>{t('onboarding.labelSettings')}</Text>
          </View>
        </>
      )}

      {/* Progress: bigger circle + arrow pointing DOWN at it + label above */}
      {progressTabPosition && (
        <>
          <View
            style={[
              staticStyles.progressRing,
              {
                left: progressTabPosition.x - PROGRESS_RING_SIZE / 2,
                top: progressTabPosition.y - PROGRESS_RING_SIZE / 2,
              },
            ]}
          />
          <View
            style={[
              staticStyles.arrowLabelGroup,
              {
                left: progressTabPosition.x - 60,
                top: progressTabPosition.y - PROGRESS_RING_SIZE / 2 - ARROW_H - 24,
                width: 120,
              },
            ]}
          >
            <Text style={staticStyles.label}>{t('onboarding.labelProgress')}</Text>
            <Svg width={24} height={ARROW_H} viewBox="0 0 24 28">
              <Path
                d="M12 0 L12 20 M6 14 L12 22 L18 14"
                stroke={HIGHLIGHT_COLOR}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
          </View>
        </>
      )}

      {/* Habits: no circle, arrow pointing DOWN at habits + label above */}
      {habitsPosition && (
        <View
          style={[
            staticStyles.arrowLabelGroup,
            {
              left: habitsPosition.x - 60,
              top: habitsPosition.y - ARROW_H - 24,
              width: 120,
            },
          ]}
        >
          <Text style={staticStyles.label}>{t('onboarding.labelHabits')}</Text>
          <Svg width={24} height={ARROW_H} viewBox="0 0 24 28">
            <Path
              d="M12 0 L12 20 M6 14 L12 22 L18 14"
              stroke={HIGHLIGHT_COLOR}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </View>
      )}
    </>
  );
}

// ---- Rendered at root layout level (like Toast) ----
export function OnboardingHighlights() {
  const [positions, setPositions] = useState<{
    settings: Position | null;
    progress: Position | null;
    habits: Position | null;
  } | null>(null);
  const opacity = useRef(new RNAnimated.Value(1)).current;
  const fadingRef = useRef(false);
  const [interactive, setInteractive] = useState(true);

  const fadeOut = useCallback(() => {
    if (fadingRef.current) return;
    fadingRef.current = true;
    setInteractive(false);
    RNAnimated.timing(opacity, {
      toValue: 0,
      duration: FADE_DURATION,
      useNativeDriver: true,
    }).start(() => {
      setPositions(null);
      fadingRef.current = false;
      setInteractive(true);
    });
  }, [opacity]);

  useEffect(() => {
    lingerListener = (settings, progress, habits) => {
      fadingRef.current = false;
      opacity.setValue(1);
      setPositions({ settings, progress, habits });
    };
    return () => { lingerListener = null; };
  }, [opacity]);

  useEffect(() => {
    if (!positions) return;
    const timer = setTimeout(fadeOut, LINGER_DURATION);
    return () => clearTimeout(timer);
  }, [positions, fadeOut]);

  if (!positions) return null;

  return (
    <RNAnimated.View style={[staticStyles.lingerOverlay, { opacity }]} pointerEvents={interactive ? 'auto' : 'none'}>
      <Pressable style={StyleSheet.absoluteFill} onPress={fadeOut}>
        <View style={staticStyles.highlightsLayer} pointerEvents="none">
          <Highlights
            settingsPosition={positions.settings}
            progressTabPosition={positions.progress}
            habitsPosition={positions.habits}
          />
        </View>
      </Pressable>
    </RNAnimated.View>
  );
}

// ---- Rendered in index.tsx ----
interface OnboardingOverlayProps {
  visible: boolean;
  onDismiss: () => void;
  settingsPosition?: Position | null;
  progressTabPosition?: Position | null;
  habitsPosition?: Position | null;
}

export function OnboardingOverlay({
  visible,
  onDismiss,
  settingsPosition,
  progressTabPosition,
  habitsPosition,
}: OnboardingOverlayProps) {
  const { t } = useTranslation();
  const colors = useColors();
  const dynamicStyles = useMemo(() => makeStyles(colors), [colors]);

  const handleDismiss = useCallback(() => {
    onDismiss();
    triggerLinger(
      settingsPosition ?? null,
      progressTabPosition ?? null,
      habitsPosition ?? null,
    );
  }, [onDismiss, settingsPosition, progressTabPosition, habitsPosition]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleDismiss}
    >
      <View style={dynamicStyles.overlay}>
        <Pressable style={dynamicStyles.backdrop} onPress={handleDismiss} />

        <Highlights
          settingsPosition={settingsPosition ?? null}
          progressTabPosition={progressTabPosition ?? null}
          habitsPosition={habitsPosition ?? null}
        />

        <View style={dynamicStyles.cardWrapper}>
          <View style={dynamicStyles.card}>
            <Text style={dynamicStyles.title}>{t('onboarding.title')}</Text>

            <View style={dynamicStyles.steps}>
              {STEPS.map((step) => (
                <View key={step.key} style={dynamicStyles.stepRow}>
                  <Text style={dynamicStyles.stepEmoji}>{step.emoji}</Text>
                  <Text style={dynamicStyles.stepText}>
                    {t(`onboarding.${step.key}`)}
                  </Text>
                </View>
              ))}
            </View>

            <Pressable
              style={({ pressed }) => [
                dynamicStyles.button,
                pressed && dynamicStyles.buttonPressed,
              ]}
              onPress={handleDismiss}
              accessibilityRole="button"
            >
              <Text style={dynamicStyles.buttonText}>
                {t('onboarding.start')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const staticStyles = StyleSheet.create({
  ring: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 3,
    borderColor: HIGHLIGHT_COLOR,
  },
  progressRing: {
    position: 'absolute',
    width: PROGRESS_RING_SIZE,
    height: PROGRESS_RING_SIZE,
    borderRadius: PROGRESS_RING_SIZE / 2,
    borderWidth: 3,
    borderColor: HIGHLIGHT_COLOR,
  },
  arrowLabelGroup: {
    position: 'absolute',
    alignItems: 'center',
  },
  label: {
    color: HIGHLIGHT_COLOR,
    fontSize: 16,
    fontFamily: Fonts.bold,
    textAlign: 'center',
    marginVertical: 2,
  },
  highlightsLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  lingerOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2000,
  },
});

function makeStyles(colors: ColorPalette) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    cardWrapper: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
      pointerEvents: 'box-none',
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      padding: 28,
      width: '100%',
      maxWidth: 360,
    },
    title: {
      fontSize: 26,
      fontFamily: Fonts.bold,
      color: colors.text,
      textAlign: 'center',
      marginBottom: 24,
    },
    steps: {
      gap: 16,
      marginBottom: 28,
    },
    stepRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    stepEmoji: {
      fontSize: 24,
    },
    stepText: {
      flex: 1,
      fontSize: 16,
      fontFamily: Fonts.medium,
      color: colors.text,
      lineHeight: 22,
    },
    button: {
      backgroundColor: colors.accent,
      borderRadius: 16,
      paddingVertical: 14,
      alignItems: 'center',
    },
    buttonPressed: {
      opacity: 0.85,
    },
    buttonText: {
      fontSize: 17,
      fontFamily: Fonts.bold,
      color: '#FFFFFF',
    },
  });
}
