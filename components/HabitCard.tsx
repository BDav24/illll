import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';

import { useColors, type ColorPalette } from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { HABIT_MAP } from '../constants/habits';
import { RewardBurst } from './RewardBurst';
import type { HabitId } from '../store/useStore';

interface HabitCardProps {
  habitId: HabitId;
  completed: boolean;
  onPress: (id: HabitId) => void;
  onInfoPress: (id: HabitId) => void;
  onCheckboxPress: (id: HabitId) => void;
}

export const HabitCard = React.memo(function HabitCard({
  habitId,
  completed,
  onPress,
  onInfoPress,
  onCheckboxPress,
}: HabitCardProps) {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const habit = HABIT_MAP[habitId];

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(habitId);
  }, [onPress, habitId]);

  const handleInfo = useCallback(() => {
    onInfoPress(habitId);
  }, [onInfoPress, habitId]);

  const handleCheckbox = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCheckboxPress(habitId);
  }, [onCheckboxPress, habitId]);

  return (
    <Pressable
      onPress={handlePress}
      accessibilityLabel={t(`habits.${habitId}.name`)}
      style={({ pressed }) => [
        styles.card,
        { borderStartColor: colors[habitId] },
        completed && styles.cardCompleted,
        pressed && styles.cardPressed,
      ]}
    >
      {/* Icon */}
      <View style={styles.iconContainer} aria-hidden>
        <Text style={styles.icon}>{habit.icon}</Text>
      </View>

      {/* Name and one-liner */}
      <View style={styles.content}>
        <Text
          style={[styles.name, completed && styles.textCompleted]}
          numberOfLines={1}
        >
          {t(`habits.${habitId}.name`)}
        </Text>
        <Text
          style={[styles.oneLiner, completed && styles.textCompleted]}
          numberOfLines={1}
        >
          {t(`habits.${habitId}.oneLiner`)}
        </Text>
      </View>

      {/* Info button - goes straight to article */}
      <Pressable
        onPress={handleInfo}
        hitSlop={8}
        style={styles.infoButton}
        accessibilityRole="button"
        accessibilityLabel={t('article.whyTitle', { habit: t(`habits.${habitId}.name`) })}
      >
        <Text style={styles.infoText}>?</Text>
      </Pressable>

      {/* Checkbox */}
      <Pressable
        onPress={handleCheckbox}
        hitSlop={10}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: completed }}
        accessibilityLabel={t(`habits.${habitId}.name`)}
        accessibilityHint={completed ? t('hub.tapToUndo') : t('hub.tapToComplete')}
      >
        <View
          style={[
            styles.checkbox,
            completed && [styles.checkboxCompleted, { backgroundColor: colors[habitId] }],
          ]}
          aria-hidden
        >
          {completed && <Text style={styles.checkmark}>✓</Text>}
          <RewardBurst trigger={completed} color={colors[habitId]} />
        </View>
      </Pressable>
    </Pressable>
  );
});

function makeStyles(colors: ColorPalette) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderStartWidth: 4,
      paddingVertical: 14,
      paddingHorizontal: 14,
      gap: 12,
    },
    cardCompleted: {
      opacity: 0.7,
    },
    cardPressed: {
      opacity: 0.8,
    },
    iconContainer: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {
      fontSize: 24,
    },
    content: {
      flex: 1,
      gap: 2,
    },
    name: {
      color: colors.text,
      fontSize: 16,
      fontFamily: Fonts.semiBold,
    },
    oneLiner: {
      color: colors.textSecondary,
      fontSize: 13,
      fontFamily: Fonts.regular,
    },
    textCompleted: {
      opacity: 0.6,
    },
    infoButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    infoText: {
      color: colors.textMuted,
      fontSize: 16,
      fontFamily: Fonts.bold,
    },
    checkbox: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: colors.checkboxBorder,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'visible',
    },
    checkboxCompleted: {
      borderWidth: 0,
    },
    checkmark: {
      color: colors.checkmark,
      fontSize: 14,
      fontFamily: Fonts.bold,
    },
  });
}
