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

## App Store Localization & Deployment

### Overview

Both stores support 20 locales (English + 19 translations). Metadata and screenshots are managed via fastlane directory structure and deployed using Docker-based fastlane.

### Directory Structure

```
fastlane/
  Appfile                          # Google Play config (package name + service account)
  Deliverfile                      # Apple App Store config
  metadata/
    android/{locale}/              # Play Store text metadata
      title.txt                    # max 30 chars
      short_description.txt        # max 80 chars
      full_description.txt         # max 4000 chars
      changelogs/1.txt
      images/                      # Created by scripts/setup-fastlane-screenshots.sh
        phoneScreenshots/          # 6 phone screenshots
        sevenInchScreenshots/      # 1 tablet 7" screenshot
        tenInchScreenshots/        # 1 tablet 10" screenshot
    ios/{locale}/                   # App Store text metadata
      name.txt                     # max 30 chars
      subtitle.txt                 # max 30 chars
      description.txt              # max 4000 chars, NO EMOJIS (Apple rejects them via API)
      keywords.txt                 # max 100 chars, comma-separated
      promotional_text.txt         # max 170 chars
      release_notes.txt
  screenshots/{locale}/            # Shared screenshot source (Apple locale names)
    1_daily_hub_progress.png       # Phone: 1290x2796 (iPhone 6.7")
    2_daily_hub_complete.png
    3_progress_streaks.png
    4_habit_article.png
    5_settings_custom.png
    6_breathing_timer.png
    tablet7_1.png                  # Android 7" tablet: 1080x1920
    tablet10_1.png                 # Android 10" tablet: 1440x2560
    resized_ipad_13_cropped.png    # iPad 13": 2064x2752 (generated from tablet10_1)
```

### Locale Name Mapping

Screenshot dirs use Apple locale names. Android metadata uses Play Console codes. The mapping script handles this.

| Language | Screenshots dir | Android metadata | iOS metadata |
|----------|----------------|-----------------|-------------|
| Arabic | ar-SA | ar | ar-SA |
| Bengali | bn-BD | bn-BD | bn-BD (not a valid Apple locale) |
| Chinese Simplified | zh-Hans | zh-CN | zh-Hans |
| Chinese Traditional | zh-Hant | zh-TW | zh-Hant |
| Hindi | hi | hi-IN | hi |
| Indonesian | id | id | id |
| Italian | it | it-IT | it |
| Japanese | ja | ja-JP | ja |
| Korean | ko | ko-KR | ko |
| Polish | pl | pl-PL | pl |
| Russian | ru | ru-RU | ru |
| Turkish | tr | tr-TR | tr |
| Vietnamese | vi | vi | vi |
| Others (de, es, fr, nl, pt-BR, th) | same | same | same |

### Screenshot Specifications

**Google Play Store:**

- Phone: PNG/JPEG, 9:16 or 16:9, sides 320-3840px (current: 1290x2796)
- 7" tablet: PNG/JPEG, 9:16, sides 320-3840px (current: 1080x1920)
- 10" tablet: PNG/JPEG, 9:16, sides 1080-7680px (current: 1440x2560)

**Apple App Store:**

- iPhone 6.7": 1290x2796 (same as phone screenshots, works directly)
- iPad 13": 2064x2752 (generated by cropping bottom of tablet10_1.png then resizing)
- Android tablet sizes (1080x1920, 1440x2560) are NOT valid Apple sizes

### Apple Store Restrictions

- **No emojis in text metadata** (description, promotional text, etc.) - the API rejects them. Use `sed` to strip before uploading: `sed -i 's/🫁 //g; s/☀️ //g; s/🥗 //g; s/😴 //g; s/🏃 //g; s/🙏 //g; s/→/-/g'`
- **Subtitle max 30 chars** - check all locales with `wc -m`
- **Bengali (bn-BD)** is not a valid Apple App Store locale - skip it
- **Name/subtitle changes** require a new app version; promotional text can be changed anytime

### API Keys

Stored in `.keys/` (gitignored)

### Deployment Commands

All fastlane commands run via Docker (no local Ruby needed). A unified script (`scripts/fastlane.ts`) handles preparation and deployment:

```bash
# 1. Generate screenshots (requires `bun run web` on port 8081)
bun scripts/generate-screenshots.ts

# 2. Deploy to stores (prepares dist/, processes images, runs Docker fastlane)
bun scripts/fastlane.ts                    # all platforms, all content
bun scripts/fastlane.ts android            # android only
bun scripts/fastlane.ts ios                # ios only
bun scripts/fastlane.ts android metadata   # android metadata only
bun scripts/fastlane.ts ios screenshots    # ios screenshots only
```

The `fastlane.ts` script automatically:

- Copies fastlane data to `dist/fastlane_android` or `dist/fastlane_ios`
- Maps screenshot locale names to each platform's expected format
- Strips emojis from iOS descriptions
- Removes invalid Apple locales (bn-BD)
- Generates iPad 13" screenshots (2064x2752) from Android tablet10_1.png (crop + resize)
- Removes Android-only tablet sizes from iOS output
- Runs the appropriate Docker fastlane command

### Workflow: Updating Store Listings

1. Edit text files in `fastlane/metadata/android/` and `fastlane/metadata/ios/`
2. For iOS descriptions: avoid emojis (the script strips them, but best to not include)
3. If screenshots changed: run `bun scripts/generate-screenshots.ts`
4. Deploy: `bun scripts/fastlane.ts` (or target a specific platform/content)
5. Apple uploads may hit 500 errors on the polling step - this is normal, the actual uploads succeed

### Troubleshooting

- **Apple 500 errors during screenshot polling**: The uploads succeeded, Apple's API is slow to process. Check ASC manually.
- **"Version number already used"**: The version exists. Use `--skip_app_version_update` or increment version.
- **"Cannot find edit app store version"**: The app version is locked (Ready for Distribution). Create a new version.
- **"Invalid characters" on Apple**: Emojis in description. Strip them from iOS metadata files.
- **"Subtitle too long"**: Apple max is 30 chars. Check with `wc -m fastlane/metadata/ios/*/subtitle.txt`.

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
