import React, { useState, useCallback } from 'react';
import { View, TextInput, Pressable, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Colors } from '../constants/colors';

interface TaskInputProps {
  onSubmit: (text: string) => void;
}

export function TaskInput({ onSubmit }: TaskInputProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState('');

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed.length === 0) return;
    onSubmit(trimmed);
    setValue('');
  }, [value, onSubmit]);

  return (
    <View style={styles.container}>
      <Pressable onPress={handleSubmit} style={styles.plusButton}>
        <Text style={styles.plusIcon}>+</Text>
      </Pressable>
      <TextInput
        style={styles.input}
        placeholder={t('hub.addTask')}
        placeholderTextColor={Colors.textMuted}
        value={value}
        onChangeText={setValue}
        onSubmitEditing={handleSubmit}
        returnKeyType="done"
        blurOnSubmit={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 8,
  },
  plusButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIcon: {
    color: Colors.textSecondary,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 22,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
    paddingVertical: 10,
  },
});
