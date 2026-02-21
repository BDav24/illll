# Custom Habits Design

## Summary

Replace the per-day "My Tasks" feature with persistent custom habits. Users create custom habits in Settings; they appear as cards below the core 6 habits on the Daily Hub. No migration of existing task data.

## Data Model

### New type

```typescript
type CustomHabit = {
  id: string;        // 'custom_' + uuid
  text: string;      // user-provided name
}
```

### Settings changes

- Add `settings.customHabits: CustomHabit[]`
- Remove task-related actions (`addTask`, `toggleTask`, `deleteTask`)
- Add `addCustomHabit(text)`, `deleteCustomHabit(id)`

### Daily tracking

Custom habits tracked in `days[date].habits` alongside core habits, keyed by `custom_*` id. Completion is a simple boolean toggle.

## Daily Hub Changes

- Remove "My Tasks" section (TaskInput + TaskItem list)
- Below core habit cards, show "My Habits" header + custom habit cards
- Custom habit cards: simplified style (no color bar, generic icon or none), text + checkbox
- Tap to toggle, same as checkbox-type core habits

## Settings Changes

- Add "My Habits" section with text input + add button for creating custom habits
- Each custom habit shows name + delete button
- Keep existing show/hide toggles for core 6 habits

## Score & Streak

- Custom habits count toward daily score and streak
- Extend scoring functions to include custom habits alongside visible core habits

## Out of Scope

- No migration of old task data
- No custom colors/icons for custom habits
- No reordering of custom habits
- Core 6 habits unchanged
