import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { Colors } from '../constants/colors';
import type { CustomTask } from '../store/useStore';

interface TaskItemProps {
  task: CustomTask;
  onToggle: () => void;
  onDelete: () => void;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <View style={styles.container}>
      {/* Checkbox */}
      <Pressable onPress={onToggle} hitSlop={6} style={styles.checkboxHit}>
        <View
          style={[
            styles.checkbox,
            task.completed && styles.checkboxCompleted,
          ]}
        >
          {task.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </Pressable>

      {/* Text */}
      <Text
        style={[styles.text, task.completed && styles.textCompleted]}
        numberOfLines={2}
      >
        {task.text}
      </Text>

      {/* Delete button */}
      <Pressable onPress={onDelete} hitSlop={8} style={styles.deleteButton}>
        <Text style={styles.deleteIcon}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 10,
  },
  checkboxHit: {
    padding: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  checkmark: {
    color: Colors.bg,
    fontSize: 12,
    fontWeight: '800',
  },
  text: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
  },
  textCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
    opacity: 0.6,
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: {
    color: Colors.textMuted,
    fontSize: 14,
  },
});
