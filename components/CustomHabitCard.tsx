import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { useColors, type ColorPalette } from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { RewardBurst } from './RewardBurst';

interface CustomHabitCardProps {
  id: string;
  text: string;
  completed: boolean;
  onPress: (id: string) => void;
  onInfoPress: (id: string) => void;
  onCheckboxPress: (id: string) => void;
  criterion?: string;
  icon?: string;
}

export const CustomHabitCard = React.memo(function CustomHabitCard({ id, text, completed, onPress, onInfoPress, onCheckboxPress, criterion, icon }: CustomHabitCardProps) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { t } = useTranslation();

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(id);
  }, [onPress, id]);

  const handleInfo = useCallback(() => {
    onInfoPress(id);
  }, [onInfoPress, id]);

  const handleCheckbox = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCheckboxPress(id);
  }, [onCheckboxPress, id]);

  return (
    <Pressable
      onPress={handlePress}
      accessibilityLabel={text}
      style={({ pressed }) => [
        styles.card,
        completed && styles.cardCompleted,
        pressed && styles.cardPressed,
      ]}
    >
      {icon ? (
        <View style={styles.iconContainer} aria-hidden>
          <Text style={styles.icon}>{icon}</Text>
        </View>
      ) : null}
      <View style={styles.textContainer}>
        <Text
          style={[styles.text, completed && styles.textCompleted]}
          numberOfLines={1}
        >
          {text}
        </Text>
        {criterion ? (
          <Text style={styles.criterion} numberOfLines={1}>{criterion}</Text>
        ) : null}
      </View>
      <Pressable
        onPress={handleInfo}
        hitSlop={8}
        style={styles.infoButton}
        accessibilityRole="button"
        accessibilityLabel={text}
      >
        <Text style={styles.infoText}>📑</Text>
      </Pressable>
      <Pressable
        onPress={handleCheckbox}
        hitSlop={10}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: completed }}
        accessibilityLabel={text}
        accessibilityHint={completed ? t('hub.tapToUndo') : t('hub.tapToComplete')}
      >
        <View
          style={[
            styles.checkbox,
            completed && styles.checkboxCompleted,
          ]}
        >
          {completed && <Text style={styles.checkmark}>✓</Text>}
          <RewardBurst trigger={completed} color={colors.accent} />
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
      borderStartColor: colors.accent,
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
    textContainer: {
      flex: 1,
    },
    text: {
      color: colors.text,
      fontSize: 16,
      fontFamily: Fonts.semiBold,
    },
    textCompleted: {
      opacity: 0.6,
    },
    criterion: {
      color: colors.textMuted,
      fontSize: 13,
      fontFamily: Fonts.regular,
      marginTop: 2,
    },
    infoButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
    },
    infoText: {
      fontSize: 18,
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
      backgroundColor: colors.accent,
    },
    checkmark: {
      color: colors.checkmark,
      fontSize: 14,
      fontFamily: Fonts.bold,
    },
  });
}
