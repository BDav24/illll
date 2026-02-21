# ILLLL App Improvements Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix remaining bugs, improve UX quality, and add key missing features discovered during hands-on app testing.

**Architecture:** The app is an Expo 54 React Native app with Zustand state management, MMKV persistence, file-based routing via expo-router, and i18next for i18n. All changes maintain the existing dark-first design, offline-first approach, and privacy-first architecture.

**Tech Stack:** React Native 0.81.5, Expo 54, TypeScript, Zustand 5, react-native-reanimated, react-native-svg, i18next

---

## Priority 1: Bug Fixes

### Task 1: Fix WeeklyChart raw float display

The weekly chart on the Progress screen displays raw floats like `0.571428571428571` instead of formatted labels. The score value (0-1 ratio) is rendered directly as the SVG text label.

**Files:**

- Modify: `components/WeeklyChart.tsx`

**Step 1: Identify the bug**

In `WeeklyChart.tsx`, the score labels are rendered directly from the `data[i].score` value which is a 0-1 float. These need to be formatted as percentages or rounded to a display-friendly value.

Find the `<SvgText>` that renders the score label above each point. It likely does something like:

```tsx
{item.score}
```

**Step 2: Fix the label formatting**

Change the label to display as a percentage integer (e.g., `57%`), or as a fraction like `4/7`. Since the raw score is `completed/total`, the most user-friendly format is a percentage:

```tsx
{Math.round(item.score * 100)}%
```

For zero values, show nothing or `0%` to avoid clutter.

**Step 3: Verify on Progress screen**

Navigate to Progress tab, confirm Saturday shows `57%` instead of `0.571428571428571`. Confirm all days show clean labels.

**Step 4: Commit**

```bash
git add components/WeeklyChart.tsx
git commit -m "fix: format weekly chart score labels as percentages"
```

---

### Task 2: Fix Heatmap year truncation

The heatmap on the Progress screen only shows roughly the first half of the year (J through J = Jan-Jul). The remaining months are cut off, likely because the ScrollView or container width is insufficient.

**Files:**

- Modify: `components/Heatmap.tsx`

**Step 1: Diagnose the truncation**

Read `Heatmap.tsx` and check:

1. Whether the total width calculation accounts for all 52-53 weeks
2. Whether the ScrollView is configured for horizontal scrolling
3. Whether a `contentContainerStyle` with the correct width is set

The component likely calculates column positions but the container doesn't expand to fit all months.

**Step 2: Fix the container width**

Ensure the heatmap's inner container has a `width` or `minWidth` that accounts for all week columns. If using a ScrollView, ensure `horizontal={true}` and the content width matches `totalWeeks * cellSize`.

**Step 3: Verify**

Navigate to Progress tab, scroll the heatmap horizontally. All 12 months (J F M A M J J A S O N D) should be visible.

**Step 4: Commit**

```bash
git add components/Heatmap.tsx
git commit -m "fix: heatmap shows full year instead of being truncated"
```

---

### Task 3: Fix BreathingTimer state closure bug

The BreathingTimer uses both `currentRound` state and a `roundRef.current` - the state can become stale inside the `startPhase` callback due to JavaScript closures over the initial state value.

**Files:**

- Modify: `components/BreathingTimer.tsx`

**Step 1: Read and understand the current implementation**

Identify where `currentRound` state is read inside timer callbacks. The issue is that `setTimeout`/`setInterval` callbacks close over stale state values.

**Step 2: Consolidate to use only refs for timer logic**

For timer-driven logic, use `roundRef.current` exclusively for reads inside callbacks, and only use `setCurrentRound` state to trigger re-renders for the UI. Make sure every place that reads the round count inside a timer uses the ref, not the state.

Pattern:

```tsx
const roundRef = useRef(0);
const [currentRound, setCurrentRound] = useState(0);

const advanceRound = useCallback(() => {
  roundRef.current += 1;
  setCurrentRound(roundRef.current);
}, []);
```

**Step 3: Add cleanup on unmount**

Ensure all `setTimeout`/`setInterval` handles are cleared in the component's cleanup:

```tsx
useEffect(() => {
  return () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };
}, []);
```

**Step 4: Manual test**

Open the breathing timer, complete 4 rounds. Verify the round counter progresses correctly: 1/4, 2/4, 3/4, 4/4, then calls `onComplete`.

**Step 5: Commit**

```bash
git add components/BreathingTimer.tsx
git commit -m "fix: breathing timer round counting uses refs to avoid stale closures"
```

---

### Task 4: Fix Settings close button on web

The close button (X) on the Settings screen calls `router.back()` but this doesn't work reliably on web when navigating via Expo Router's modal presentation. The button appears to do nothing.

**Files:**

- Modify: `app/settings.tsx`

**Step 1: Diagnose**

The issue is that on web, `router.back()` may not have navigation history if the modal was opened programmatically. The fix is to use `router.canGoBack() ? router.back() : router.replace('/')`.

**Step 2: Fix the close handler**

```tsx
const handleClose = () => {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/');
  }
};
```

Update the Pressable to use `handleClose` instead of inline `router.back()`.

**Step 3: Verify**

Open settings via gear icon, click X button. Should navigate back to the daily hub.

**Step 4: Commit**

```bash
git add app/settings.tsx
git commit -m "fix: settings close button works on web with fallback navigation"
```

---

## Priority 2: UX Improvements

### Task 5: Add empty state for first-time users

When the app loads for the first time, the daily hub looks functional but gives no guidance. A subtle onboarding hint would help.

**Files:**

- Modify: `app/(tabs)/index.tsx`
- Modify: `locales/en.json` (and other locale files)

**Step 1: Add translation keys**

Add to `locales/en.json`:

```json
"hub": {
  ...existing keys...
  "welcomeHint": "Tap a habit to mark it done!"
}
```

**Step 2: Show hint when no habits are completed today**

In DailyHub, when `score.completed === 0` and `score.total > 0`, show a subtle hint text below the streak section:

```tsx
{score.completed === 0 && (
  <Text style={styles.welcomeHint}>{t('hub.welcomeHint')}</Text>
)}
```

Style it as a muted, centered text.

**Step 3: Commit**

```bash
git add app/(tabs)/index.tsx locales/en.json
git commit -m "feat: show onboarding hint for first-time users"
```

---

### Task 6: Improve task checkbox touch target and feedback

The task checkbox and delete button are small and lack visual feedback. The `hitSlop` prop doesn't work on web.

**Files:**

- Modify: `components/TaskItem.tsx`

**Step 1: Increase touch targets**

Wrap the checkbox area and delete button in larger Pressable containers with minimum 44x44 touch targets:

```tsx
<Pressable
  onPress={onToggle}
  style={styles.checkboxArea}  // min 44x44
>
  <View style={[styles.checkbox, task.completed && styles.checkboxDone]}>
    {task.completed && <Text style={styles.check}>✓</Text>}
  </View>
</Pressable>
```

**Step 2: Add press feedback**

Use Pressable's `({ pressed })` style function to add opacity feedback on press.

**Step 3: Commit**

```bash
git add components/TaskItem.tsx
git commit -m "feat: larger touch targets and press feedback for task items"
```

---

### Task 7: Add confirmation before task deletion

Tasks can be deleted with a single tap on the X button. On mobile this is fine, but there's no undo mechanism. Add a brief visual confirmation or use a swipe-to-delete pattern.

**Files:**

- Modify: `components/TaskItem.tsx`

**Step 1: Add deletion confirmation**

The simplest approach: when the delete button is tapped, change it to a red "confirm" state for 2 seconds. If tapped again within that window, delete. Otherwise, revert.

```tsx
const [confirmDelete, setConfirmDelete] = useState(false);
const timerRef = useRef<NodeJS.Timeout>();

const handleDelete = useCallback(() => {
  if (confirmDelete) {
    onDelete();
  } else {
    setConfirmDelete(true);
    timerRef.current = setTimeout(() => setConfirmDelete(false), 2000);
  }
}, [confirmDelete, onDelete]);

useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);
```

Show the delete button in red when `confirmDelete` is true.

**Step 2: Commit**

```bash
git add components/TaskItem.tsx
git commit -m "feat: two-tap delete confirmation for tasks"
```

---

### Task 8: Add pull-to-refresh / date change handling

If the app is open across midnight, the date doesn't update. The user sees yesterday's data under the current date.

**Files:**

- Modify: `app/(tabs)/index.tsx`

**Step 1: Add date change detection**

Use a `useEffect` with a 60-second interval to check if the date key has changed:

```tsx
const [currentDateKey, setCurrentDateKey] = useState(getTodayKey());

useEffect(() => {
  const interval = setInterval(() => {
    const newKey = getTodayKey();
    if (newKey !== currentDateKey) {
      setCurrentDateKey(newKey);
    }
  }, 60000);
  return () => clearInterval(interval);
}, [currentDateKey]);
```

Use `currentDateKey` instead of calling `getTodayKey()` directly so the component re-renders on date change.

**Step 2: Commit**

```bash
git add app/(tabs)/index.tsx
git commit -m "feat: auto-detect date change at midnight"
```

---

## Priority 3: Polish

### Task 9: Improve DailyScore accessibility

The score ring has no accessible labels. Screen readers can't determine the progress.

**Files:**

- Modify: `components/DailyScore.tsx`

**Step 1: Add accessible props**

```tsx
<View
  style={styles.container}
  accessibilityRole="progressbar"
  accessibilityLabel={`${completed} of ${total} habits completed`}
  accessibilityValue={{ min: 0, max: total, now: completed }}
>
```

**Step 2: Commit**

```bash
git add components/DailyScore.tsx
git commit -m "feat: add accessibility labels to daily score ring"
```

---

### Task 10: Add accessible labels to HabitCard

Habit cards lack screen reader support.

**Files:**

- Modify: `components/HabitCard.tsx`

**Step 1: Add accessibility props to the main Pressable**

```tsx
<Pressable
  onPress={handlePress}
  accessibilityRole="checkbox"
  accessibilityState={{ checked: completed }}
  accessibilityLabel={t(`${habit.i18nKey}.name`)}
  accessibilityHint={completed ? t('hub.tapToUndo') : t('hub.tapToComplete')}
  style={...}
>
```

**Step 2: Add translation keys for hints**

Add to `locales/en.json`:

```json
"hub": {
  ...
  "tapToComplete": "Tap to mark as done",
  "tapToUndo": "Tap to undo"
}
```

**Step 3: Commit**

```bash
git add components/HabitCard.tsx locales/en.json
git commit -m "feat: add accessibility labels to habit cards"
```

---

### Task 11: Add loading/splash handling for web

When the app loads on web, there's a brief blank white flash before the dark UI renders. This is jarring.

**Files:**

- Modify: `app/_layout.tsx`

**Step 1: Set initial background color**

The `index.html` body already has no background color set. The Expo template generates the HTML. Add a background color to the root layout that matches immediately:

In `_layout.tsx`, ensure the root `GestureHandlerRootView` has `backgroundColor: '#0F0F0F'` (already present). Additionally, check `app.json` splash backgroundColor is `#0F0F0F` (already set).

For web specifically, we can add a `<style>` injection or verify the HTML template has `body { background-color: #0F0F0F; }`. Check if `expo-system-ui` is handling this.

**Step 2: Verify**

Reload the web app. The background should be dark from the first frame.

**Step 3: Commit**

```bash
git add app/_layout.tsx
git commit -m "fix: eliminate white flash on web load"
```

---

## Priority 4: Future Enhancements (lower priority)

These are larger features that would significantly improve the app but require more design work:

### Task 12: Light mode support

- Add light color palette to `constants/colors.ts`
- Create a `useColorScheme` hook that reads system preference
- Update all components to use dynamic colors
- Estimated: 2-3 hours

### Task 13: Habit reordering via drag-and-drop

- Add drag handles to HabitCard
- Implement drag-and-drop with `react-native-reanimated` gestures
- Persist order to store
- Estimated: 2-3 hours

### Task 14: Weekly/monthly goal setting

- Add goal configuration to settings (e.g., "complete 5/6 habits 5 days/week")
- Show goal progress in the Progress tab
- Add streak calculations based on goals vs raw completions
- Estimated: 3-4 hours

### Task 15: Data export

- Add "Export Data" button in settings
- Export as JSON or CSV
- Use `expo-sharing` for native, download for web
- Estimated: 1-2 hours

### Task 16: Internationalize article content

- Move article text from `constants/articles.ts` to locale files
- Structure translation keys as `articles.breathing.tldr`, etc.
- Add translations for top languages
- Estimated: 2-3 hours

---

## Summary

| Priority | Tasks | Focus |
|----------|-------|-------|
| P1 - Bugs | 1-4 | Fix broken functionality |
| P2 - UX | 5-8 | Improve daily usage experience |
| P3 - Polish | 9-11 | Accessibility and loading |
| P4 - Future | 12-16 | Major feature additions |

**Recommended execution order:** Tasks 1-4 first (all bugs), then Tasks 5-8 (UX), then 9-11 (polish). P4 tasks are independent and can be tackled in any order later.
