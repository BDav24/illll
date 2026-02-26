# CLAUDE.md - Development Guide for AI Assistants

This file contains project-specific guidance for AI assistants working on the ILLLL codebase.

## Project Overview

ILLLL (I'll Live Longer) is a React Native mobile app built with Expo that helps users track evidence-based longevity habits. The app emphasizes simplicity, beautiful design, and scientific grounding.

## Architecture

### Tech Stack

- **React Native 0.81.5** with Expo 54.x (New Architecture enabled)
- **TypeScript** for type safety
- **Expo Router** for file-based navigation
- **Zustand** for global state management
- **MMKV** for fast, encrypted local storage
- **i18next** for internationalization (20+ languages)

### Key Patterns

#### State Management

- Single Zustand store in `store/useStore.ts`
- Store is persisted to MMKV automatically
- State includes: daily entries, user preferences, habit visibility
- Selectors are used to compute derived values (e.g., streaks, scores)

#### Navigation

- File-based routing via Expo Router
- `app/(tabs)/` contains tab navigation screens
- `app/habit/[id].tsx` is a dynamic route for habit details
- Use `useRouter()` hook for programmatic navigation

#### Data Structure

```typescript
// Daily entry stored by date key (YYYY-MM-DD)
{
  date: string;
  habits: {
    [habitId]: {
      completed: boolean;
      data?: any; // habit-specific data (e.g., breathing rounds)
    }
  };
  tasks: Array<{
    id: string;
    text: string;
    completed: boolean;
  }>;
}
```

#### Internationalization

- All user-facing strings must use `t()` from `useTranslation()`
- Translation keys follow the pattern: `section.subsection.key`
- Example: `t('habits.breathing.name')`
- Add new strings to ALL locale files in `locales/`

#### Styling

- Use StyleSheet.create() for performance
- Colors defined in `constants/colors.ts`
- Dark mode is automatic based on system preference
- Maintain consistent spacing: 4, 8, 12, 16, 20, 24px

## Code Conventions

### TypeScript

- Use strict TypeScript
- Define types/interfaces for all props and data structures
- Export types when they're shared across files
- Prefer `type` over `interface` for simple object shapes

### React Components

- Use functional components with hooks
- Prefer named exports for components
- Use `useCallback` for event handlers to prevent re-renders
- Use `useMemo` for expensive computations

### File Organization

- One component per file
- Component files in PascalCase: `HabitCard.tsx`
- Utility/config files in camelCase: `useStore.ts`
- Co-locate styles with components using StyleSheet

### Naming Conventions

- Components: PascalCase (`DailyScore`)
- Functions/variables: camelCase (`toggleHabit`)
- Constants: UPPER_SNAKE_CASE (`HABIT_MAP`)
- Types/Interfaces: PascalCase (`HabitMeta`)

## Development Guidelines

### Adding a New Habit

1. Update `HabitId` type in `store/useStore.ts`
2. Add habit metadata to `constants/habits.ts`
3. Add translations to all locale files
4. Optionally add an article in `constants/articles.ts`
5. Update UI components if new quick action type is needed

### Adding a New Feature

1. Check if it requires new state → update `store/useStore.ts`
2. Add necessary components to `components/`
3. Update relevant screens in `app/`
4. Add translations for any new user-facing text
5. Maintain backwards compatibility with existing data

### Modifying State

- Never mutate state directly
- Use Zustand's set/get methods
- Update both in-memory state and MMKV storage
- Test with existing data to ensure migrations work

### Performance Considerations

- MMKV is fast but serialize/deserialize has cost
- Use selectors to prevent unnecessary re-renders
- Minimize state updates on every keystroke
- Use React Native's performance profiler for bottlenecks

### Accessibility

- Not yet implemented, but should be added:
  - Accessible labels for icons/buttons
  - Screen reader support
  - Larger touch targets (minimum 44x44)

## Testing Strategy

### Manual Testing Checklist

- [ ] Test on both iOS and Android
- [ ] Test dark and light modes
- [ ] Test multiple languages (especially RTL like Arabic)
- [ ] Test with empty state (first launch)
- [ ] Test with existing data (upgrades)
- [ ] Test streak calculations across day boundaries
- [ ] Test offline behavior (no network required)

### Common Issues

- **Streaks not updating**: Check timezone handling in `getTodayKey()`
- **Translations missing**: Ensure key exists in ALL locale files
- **Storage not persisting**: Verify MMKV is initialized before store
- **Animations janky**: Check for console warnings, use `useNativeDriver`

## File-Specific Notes

### `store/useStore.ts`

- Single source of truth for all app state
- Automatically persists to MMKV
- Contains all business logic (streak calculation, scoring, etc.)
- Use selectors (e.g., `useStore(s => s.getStreak())`) for derived data

### `constants/habits.ts`

- Defines the six core habits
- Each habit has: id, icon (emoji), color, i18nKey, quickActionType
- `HABIT_MAP` provides O(1) lookup by id

### `app/(tabs)/index.tsx`

- Main "Daily Hub" screen
- Shows greeting, date, score, streak, habits, and tasks
- Bottom sheet for habit quick actions
- Most complex screen - handle with care

### `components/`

- Self-contained, reusable UI components
- Props should be explicit and typed
- Avoid tight coupling to store (pass data as props when possible)

## Common Tasks

### Adding a Translation

```typescript
// 1. Add to locales/en.json
{
  "section": {
    "newKey": "English text"
  }
}

// 2. Add to ALL other locale files (or copy English as placeholder)

// 3. Use in component
const { t } = useTranslation();
<Text>{t('section.newKey')}</Text>
```

### Adding a New Screen

```typescript
// 1. Create file in app/ (e.g., app/stats.tsx)
export default function StatsScreen() {
  return <View>...</View>;
}

// 2. Add to tab navigation if needed (app/(tabs)/_layout.tsx)

// 3. Link to it
import { useRouter } from 'expo-router';
const router = useRouter();
router.push('/stats');
```

### Updating State

```typescript
// In store/useStore.ts
setters: (set, get) => ({
  myNewAction: (param: string) => {
    set((state) => ({
      myData: param,
    }));
  },
});

// In component
const myNewAction = useStore((s) => s.myNewAction);
myNewAction('value');
```

## Important Notes

- **Privacy First**: All data stays on device, no analytics, no tracking
- **Offline First**: App works completely offline
- **Battery Conscious**: Avoid background tasks, keep animations efficient
- **Cross-Platform**: Test features on both iOS and Android
- **Backwards Compatible**: Don't break existing user data

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnavigator.org/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [i18next Documentation](https://www.i18next.com/)

## Questions?

When in doubt:

1. Check existing patterns in the codebase
2. Prioritize user experience and simplicity
3. Maintain the current design language
4. Don't add complexity without clear benefit
