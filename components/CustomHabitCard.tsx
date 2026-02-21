import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';

interface CustomHabitCardProps {
  text: string;
  completed: boolean;
  onPress: () => void;
}

export function CustomHabitCard({ text, completed, onPress }: CustomHabitCardProps) {
  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: completed }}
      accessibilityLabel={text}
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
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
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
    color: Colors.text,
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
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    borderWidth: 0,
    backgroundColor: Colors.accent,
  },
  checkmark: {
    color: Colors.bg,
    fontSize: 14,
    fontFamily: Fonts.bold,
  },
});
