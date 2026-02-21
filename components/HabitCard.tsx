import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';

import { Colors } from '../constants/colors';
import { HABIT_MAP } from '../constants/habits';
import type { HabitId } from '../store/useStore';

interface HabitCardProps {
  habitId: HabitId;
  completed: boolean;
  onPress: () => void;
  onInfoPress: () => void;
}

export function HabitCard({
  habitId,
  completed,
  onPress,
  onInfoPress,
}: HabitCardProps) {
  const { t } = useTranslation();
  const habit = HABIT_MAP[habitId];

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: completed }}
      accessibilityLabel={t(`${habit.i18nKey}.name`)}
      accessibilityHint={completed ? t('hub.tapToUndo') : t('hub.tapToComplete')}
      style={({ pressed }) => [
        styles.card,
        { borderLeftColor: habit.color },
        completed && styles.cardCompleted,
        pressed && styles.cardPressed,
      ]}
    >
      {/* Icon */}
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{habit.icon}</Text>
      </View>

      {/* Name and one-liner */}
      <View style={styles.content}>
        <Text
          style={[styles.name, completed && styles.textCompleted]}
          numberOfLines={1}
        >
          {t(`${habit.i18nKey}.name`)}
        </Text>
        <Text
          style={[styles.oneLiner, completed && styles.textCompleted]}
          numberOfLines={1}
        >
          {t(`${habit.i18nKey}.oneLiner`)}
        </Text>
      </View>

      {/* Info button */}
      <Pressable
        onPress={onInfoPress}
        hitSlop={8}
        style={styles.infoButton}
      >
        <Text style={styles.infoText}>?</Text>
      </Pressable>

      {/* Checkbox */}
      <View
        style={[
          styles.checkbox,
          completed && [styles.checkboxCompleted, { backgroundColor: habit.color }],
        ]}
      >
        {completed && <Text style={styles.checkmark}>✓</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderLeftWidth: 4,
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
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  oneLiner: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  textCompleted: {
    opacity: 0.6,
  },
  infoButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    borderWidth: 0,
  },
  checkmark: {
    color: Colors.bg,
    fontSize: 14,
    fontWeight: '800',
  },
});
