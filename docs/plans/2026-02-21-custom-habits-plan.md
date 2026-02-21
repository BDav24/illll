# Custom Habits Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace per-day "My Tasks" with persistent custom habits managed in Settings, displayed as cards below core habits on the Daily Hub.

**Architecture:** Custom habits are defined in `settings.customHabits` (persistent). Daily completion is tracked in `days[date].habits` using string IDs like `custom_<uuid>`. The `habits` record type is widened from `Record<HabitId, ...>` to `Record<string, ...>` to accommodate both core and custom habit IDs. Scoring/streak functions are updated to include custom habits.

**Tech Stack:** React Native, Zustand, MMKV, i18next, expo-haptics

---

### Task 1: Update store types and add custom habit actions

**Files:**
- Modify: `store/useStore.ts`

**Step 1: Update types**

Change `DayRecord.habits` from `Partial<Record<HabitId, HabitEntry>>` to `Record<string, HabitEntry>` to accept both core `HabitId` keys and `custom_*` keys. Add `CustomHabit` type. Add `customHabits` to `UserSettings`. Remove `CustomTask` type and `tasks` from `DayRecord`.

```typescript
// Replace CustomTask with:
export interface CustomHabit {
  id: string;   // 'custom_' + uuid
  text: string;
}

// Update DayRecord:
export interface DayRecord {
  date: string;
  habits: Record<string, HabitEntry>;  // was Partial<Record<HabitId, HabitEntry>>
  tasks: CustomTask[];                 // keep for backward compat, just unused
}

// Update UserSettings:
export interface UserSettings {
  hiddenHabits: HabitId[];
  habitOrder: HabitId[];
  notifications: Partial<Record<HabitId, NotificationSetting>>;
  language: string | null;
  customHabits: CustomHabit[];  // NEW
}
```

**Step 2: Update DEFAULT_SETTINGS**

Add `customHabits: []` to `DEFAULT_SETTINGS`.

**Step 3: Update StoreState actions**

Remove `addTask`, `toggleTask`, `deleteTask` from the interface. Add:

```typescript
addCustomHabit: (text: string) => void;
deleteCustomHabit: (id: string) => void;
toggleCustomHabit: (id: string) => void;
```

**Step 4: Implement new actions, remove old ones**

Remove the `addTask`, `toggleTask`, `deleteTask` implementations. Add:

```typescript
addCustomHabit: (text: string) => {
  const id = `custom_${crypto.randomUUID()}`;
  set((state) => ({
    settings: {
      ...state.settings,
      customHabits: [...state.settings.customHabits, { id, text }],
    },
  }));
},

deleteCustomHabit: (id: string) => {
  set((state) => ({
    settings: {
      ...state.settings,
      customHabits: state.settings.customHabits.filter((h) => h.id !== id),
    },
  }));
},

toggleCustomHabit: (id: string) => {
  const key = getTodayKey();
  set((state) => {
    const days = ensureDay(state.days, key);
    const day = days[key];
    const existing = day.habits[id];
    const wasCompleted = existing?.completed ?? false;

    return {
      days: {
        ...days,
        [key]: {
          ...day,
          habits: {
            ...day.habits,
            [id]: {
              completed: !wasCompleted,
              timestamp: Date.now(),
            },
          },
        },
      },
    };
  });
},
```

**Step 5: Update `toggleHabit` type signature**

Widen `toggleHabit` parameter from `HabitId` to `HabitId` (keep as-is since core habits still use this). The new `toggleCustomHabit` handles custom IDs separately.

**Step 6: Update `getDayScore`**

```typescript
export function getDayScore(
  day: DayRecord | undefined,
  visibleHabits: HabitId[],
  customHabits: CustomHabit[],
): { completed: number; total: number } {
  if (!day) return { completed: 0, total: visibleHabits.length + customHabits.length };

  let completed = 0;
  const total = visibleHabits.length + customHabits.length;

  for (const hid of visibleHabits) {
    if (day.habits[hid]?.completed) completed++;
  }
  for (const ch of customHabits) {
    if (day.habits[ch.id]?.completed) completed++;
  }

  return { completed, total };
}
```

**Step 7: Update `getStreak`**

Same pattern — add `customHabits: CustomHabit[]` parameter. Include custom habit completions in the count.

```typescript
export function getStreak(
  days: Record<string, DayRecord>,
  visibleHabits: HabitId[],
  customHabits: CustomHabit[],
): number {
  // ... same loop but count custom habit completions too
}
```

**Step 8: Commit**

```
feat: update store types and actions for custom habits
```

---

### Task 2: Update Daily Hub to show custom habits

**Files:**
- Modify: `app/(tabs)/index.tsx`
- Create: `components/CustomHabitCard.tsx`

**Step 1: Create CustomHabitCard component**

A simplified version of HabitCard — no color bar, no info button, no icon. Just text + checkbox. Uses `Colors.accent` for the completed checkbox.

```typescript
// components/CustomHabitCard.tsx
import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/colors';

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
```

Styles: surface background, rounded 16, padding 14, row layout. Checkbox uses `Colors.accent` when completed. Same visual family as HabitCard but simpler.

**Step 2: Update Daily Hub**

- Remove imports: `TaskInput`, `TaskItem`
- Remove store selectors: `addTask`, `toggleTask`, `deleteTask`
- Add store selectors: `toggleCustomHabit`
- Add `customHabits` from `settings.customHabits`
- Update `score` useMemo to pass `customHabits` to `getDayScore`
- Update `streak` useMemo to pass `customHabits` to `getStreak`
- Replace "My Tasks" section with custom habits section:

```tsx
{/* Custom Habits */}
{settings.customHabits.length > 0 && (
  <View style={styles.customHabitsSection}>
    <Text style={styles.sectionTitle}>{t('hub.myHabits')}</Text>
    {settings.customHabits.map((ch) => (
      <CustomHabitCard
        key={ch.id}
        text={ch.text}
        completed={today.habits[ch.id]?.completed ?? false}
        onPress={() => toggleCustomHabit(ch.id)}
      />
    ))}
  </View>
)}
```

- Remove `tasksSection` style, add `customHabitsSection` style (gap: 12, marginBottom: 16)

**Step 3: Commit**

```
feat: display custom habits as cards on Daily Hub
```

---

### Task 3: Add custom habit management to Settings

**Files:**
- Modify: `app/settings.tsx`

**Step 1: Add custom habits section**

After the core habits toggle section, add a "My Habits" section with:
- Each custom habit as a row: text + delete button (same style as habit toggle rows)
- A TaskInput-style text input at the bottom to add new ones

```tsx
{/* Custom Habits Section */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>{t('settings.myHabits')}</Text>
  {settings.customHabits.map((ch) => (
    <View key={ch.id} style={styles.habitRow}>
      <Text style={styles.habitName}>{ch.text}</Text>
      <Pressable onPress={() => deleteCustomHabit(ch.id)}>
        <Text style={styles.deleteIcon}>✕</Text>
      </Pressable>
    </View>
  ))}
  <View style={styles.addHabitRow}>
    <TextInput
      style={styles.addHabitInput}
      placeholder={t('settings.addHabit')}
      placeholderTextColor={Colors.textMuted}
      value={newHabitText}
      onChangeText={setNewHabitText}
      onSubmitEditing={handleAddHabit}
      returnKeyType="done"
    />
    <Pressable onPress={handleAddHabit} style={styles.addHabitBtn}>
      <Text style={styles.addHabitBtnText}>+</Text>
    </Pressable>
  </View>
</View>
```

Wire up `addCustomHabit` and `deleteCustomHabit` from the store. Add local state `newHabitText` for the input.

**Step 2: Add styles**

```typescript
deleteIcon: {
  color: Colors.textMuted,
  fontSize: 16,
  padding: 8,
},
addHabitRow: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: Colors.surface,
  borderRadius: 12,
  paddingHorizontal: 12,
  paddingVertical: 4,
  gap: 8,
},
addHabitInput: {
  flex: 1,
  color: Colors.text,
  fontSize: 15,
  paddingVertical: 10,
},
addHabitBtn: {
  width: 28,
  height: 28,
  borderRadius: 14,
  backgroundColor: Colors.surfaceLight,
  alignItems: 'center',
  justifyContent: 'center',
},
addHabitBtnText: {
  color: Colors.textSecondary,
  fontSize: 20,
  fontWeight: '600',
  lineHeight: 22,
},
```

**Step 3: Commit**

```
feat: add custom habit management to Settings
```

---

### Task 4: Add translations for all 20 locale files

**Files:**
- Modify: all 20 files in `locales/*.json`

**Step 1: Add new keys to en.json**

```json
{
  "hub": {
    "myHabits": "My Habits"
  },
  "settings": {
    "myHabits": "My Habits",
    "addHabit": "Add a habit..."
  }
}
```

Remove `hub.tasksTitle` and `hub.addTask` keys.

**Step 2: Add same keys to all other 19 locale files**

Use English as placeholder for all non-English locales. Remove `hub.tasksTitle` and `hub.addTask` from all.

**Step 3: Commit**

```
feat: add custom habits translations to all locales
```

---

### Task 5: Update progress screen

**Files:**
- Modify: `app/(tabs)/progress.tsx`

**Step 1: Update scoring calls**

Pass `settings.customHabits` to `getDayScore` and `getStreak` calls. Add `settings` store selector if not already available (it is — line 27).

**Step 2: Commit**

```
feat: include custom habits in progress scoring
```

---

### Task 6: Clean up unused components

**Files:**
- Delete: `components/TaskInput.tsx`
- Delete: `components/TaskItem.tsx`

**Step 1: Delete TaskInput.tsx and TaskItem.tsx**

These are no longer imported anywhere.

**Step 2: Commit**

```
chore: remove unused TaskInput and TaskItem components
```

---

### Task 7: Verify and test

**Step 1: Run TypeScript compiler**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 2: Run Expo bundler check**

```bash
npx expo export --platform web --output-dir /tmp/illl-check --clear 2>&1 | head -20
```

Expected: bundles successfully.

**Step 3: Manual test checklist**

- [ ] Settings: can add a custom habit
- [ ] Settings: can delete a custom habit
- [ ] Daily Hub: custom habits appear below core 6
- [ ] Daily Hub: tapping toggles completion
- [ ] Daily Hub: score ring includes custom habits
- [ ] Daily Hub: streak includes custom habits
- [ ] Progress screen: scoring includes custom habits
- [ ] Custom habits persist across app restart
- [ ] Custom habits appear every day (not per-day)

**Step 4: Commit**

```
chore: verify custom habits implementation
```
