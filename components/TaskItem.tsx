import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { Colors } from '../constants/colors';
import type { CustomTask } from '../store/useStore';

interface TaskItemProps {
  task: CustomTask;
  onToggle: () => void;
  onDelete: () => void;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleDelete = useCallback(() => {
    if (confirmDelete) {
      if (timerRef.current) clearTimeout(timerRef.current);
      onDelete();
    } else {
      setConfirmDelete(true);
      timerRef.current = setTimeout(() => setConfirmDelete(false), 2000);
    }
  }, [confirmDelete, onDelete]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <View style={styles.container}>
      {/* Checkbox */}
      <Pressable onPress={onToggle} style={({ pressed }) => [styles.checkboxHit, pressed && { opacity: 0.5 }]}>
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
      <Pressable onPress={handleDelete} style={({ pressed }) => [styles.deleteButton, pressed && { opacity: 0.5 }]}>
        <Text style={[styles.deleteIcon, confirmDelete && { color: Colors.danger }]}>✕</Text>
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
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
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
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: {
    color: Colors.textMuted,
    fontSize: 14,
  },
});
