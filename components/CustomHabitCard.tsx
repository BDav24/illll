import React, { useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { useColors, type ColorPalette } from '../constants/colors';
import { Fonts } from '../constants/fonts';

interface CustomHabitCardProps {
  id: string;
  text: string;
  completed: boolean;
  onPress: (id: string) => void;
  onLongPress?: (id: string) => void;
  criterion?: string;
}

export const CustomHabitCard = React.memo(function CustomHabitCard({ id, text, completed, onPress, onLongPress, criterion }: CustomHabitCardProps) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { t } = useTranslation();

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(id);
  }, [onPress, id]);

  const handleLongPress = useCallback(() => {
    if (onLongPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onLongPress(id);
    }
  }, [onLongPress, id]);

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: completed }}
      accessibilityLabel={text}
      accessibilityHint={completed ? t('hub.tapToUndo') : t('hub.tapToComplete')}
      style={({ pressed }) => [
        styles.card,
        completed && styles.cardCompleted,
        pressed && styles.cardPressed,
      ]}
    >
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
      <View
        style={[
          styles.checkbox,
          completed && styles.checkboxCompleted,
        ]}
      >
        {completed && <Text style={styles.checkmark}>✓</Text>}
      </View>
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
      borderLeftWidth: 4,
      borderLeftColor: colors.accent,
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
    checkbox: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
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
