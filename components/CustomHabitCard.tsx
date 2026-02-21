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
}

export const CustomHabitCard = React.memo(function CustomHabitCard({ id, text, completed, onPress }: CustomHabitCardProps) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { t } = useTranslation();

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(id);
  }, [onPress, id]);

  return (
    <Pressable
      onPress={handlePress}
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
      <Text
        style={[styles.text, completed && styles.textCompleted]}
        numberOfLines={1}
      >
        {text}
      </Text>
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
    text: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
      fontFamily: Fonts.semiBold,
    },
    textCompleted: {
      opacity: 0.6,
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
