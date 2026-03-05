import React, { useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
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

const HIGHLIGHT_COLOR = '#FF3B30';
const ARROW_H = 28;

const RING_SIZE = 48;
const PROGRESS_RING_SIZE = 80;

// ---- Inline hint rendered next to target elements ----
export function OnboardingHint({
  label,
  direction,
  ring,
  style,
}: {
  label: string;
  direction: 'up' | 'down';
  ring?: 'small' | 'large';
  style?: object;
}) {
  const ringSize = ring === 'large' ? PROGRESS_RING_SIZE : RING_SIZE;
  return (
    <View style={[hintStyles.container, style]}>
      {direction === 'up' && ring && (
        <View style={[hintStyles.ring, { width: ringSize, height: ringSize, borderRadius: ringSize / 2 }]} />
      )}
      {direction === 'down' && <Text style={hintStyles.label}>{label}</Text>}
      <Svg width={24} height={ARROW_H} viewBox="0 0 24 28">
        <Path
          d={
            direction === 'up'
              ? 'M12 28 L12 8 M6 14 L12 6 L18 14'
              : 'M12 0 L12 20 M6 14 L12 22 L18 14'
          }
          stroke={HIGHLIGHT_COLOR}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
      {direction === 'down' && ring && (
        <View style={[hintStyles.ring, { width: ringSize, height: ringSize, borderRadius: ringSize / 2 }]} />
      )}
      {direction === 'up' && <Text style={hintStyles.label}>{label}</Text>}
    </View>
  );
}

const hintStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  label: {
    color: HIGHLIGHT_COLOR,
    fontSize: 16,
    fontFamily: Fonts.bold,
    textAlign: 'center',
    marginVertical: 2,
  },
  ring: {
    borderWidth: 3,
    borderColor: HIGHLIGHT_COLOR,
  },
});

// ---- Rendered in index.tsx ----
interface OnboardingOverlayProps {
  visible: boolean;
  onDismiss: () => void;
}

export function OnboardingOverlay({
  visible,
  onDismiss,
}: OnboardingOverlayProps) {
  const { t } = useTranslation();
  const colors = useColors();
  const dynamicStyles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
    >
      <View style={dynamicStyles.overlay}>
        <Pressable style={dynamicStyles.backdrop} onPress={onDismiss} />

        <View style={dynamicStyles.cardWrapper}>
          <View style={dynamicStyles.card}>
            <Text style={dynamicStyles.title}>{t('onboarding.title')}</Text>
            <Text style={dynamicStyles.subtitle}>{t('onboarding.subtitle')}</Text>

            <View style={dynamicStyles.steps}>
              {STEPS.map((step, index) => (
                <View key={step.key} style={dynamicStyles.stepRow}>
                  <Text style={dynamicStyles.stepEmoji}>{step.emoji}</Text>
                  <Text style={dynamicStyles.stepText}>
                    {index + 1}. {t(`onboarding.${step.key}`)}
                  </Text>
                </View>
              ))}
            </View>

            <Pressable
              style={({ pressed }) => [
                dynamicStyles.button,
                pressed && dynamicStyles.buttonPressed,
              ]}
              onPress={onDismiss}
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
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 15,
      fontFamily: Fonts.semiBold,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 21,
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
