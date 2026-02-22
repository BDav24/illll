# Screenshot Plan — ILLLL Store Listings

## Dimensions

| Platform | Width | Height | Notes |
|----------|-------|--------|-------|
| iOS 6.7" (iPhone 15 Pro Max) | 1290 | 2796 | Required for App Store |
| Android phone | 1284 | 2778 | Recommended 16:9 or taller |

## Screenshots (6 per platform, same screens)

### Screenshot 1: Daily Hub — In Progress

- **Screen:** Daily Hub tab, dark mode
- **State:** 3 of 6 habits completed (breathing, light, exercise checked)
- **Caption overlay:** "Track what actually matters"
- **Caption position:** Top, white text, semi-bold
- **Purpose:** Shows core daily experience, habit cards, score ring

### Screenshot 2: Daily Hub — All Done

- **Screen:** Daily Hub tab, dark mode
- **State:** 6 of 6 habits completed, "All done" celebration visible
- **Caption overlay:** "Six habits backed by research"
- **Caption position:** Top, white text, semi-bold
- **Purpose:** Shows completion state, satisfaction of full score

### Screenshot 3: Progress

- **Screen:** Progress tab, dark mode
- **State:** Show with ~30 day streak, populated heatmap, weekly chart
- **Caption overlay:** "Watch your streaks grow"
- **Caption position:** Top, white text, semi-bold
- **Purpose:** Shows long-term tracking value, visual progress

### Screenshot 4: Habit Article

- **Screen:** Habit detail modal for "Exercise", dark mode
- **State:** Article expanded, showing research content
- **Caption overlay:** "Know the science behind each habit"
- **Caption position:** Top, white text, semi-bold
- **Purpose:** Shows educational depth, research-backed credibility

### Screenshot 5: Settings & Languages

- **Screen:** Settings screen with language picker open, dark mode
- **State:** Language list visible showing multiple languages
- **Caption overlay:** "20+ languages. Zero accounts."
- **Caption position:** Top, white text, semi-bold
- **Purpose:** Shows global reach and privacy (no account section visible)

### Screenshot 6: Breathing Timer

- **Screen:** Breathing exercise active, dark mode
- **State:** Mid-exercise, showing inhale/exhale animation
- **Caption overlay:** "Built-in guided exercises"
- **Caption position:** Top, white text, semi-bold
- **Purpose:** Shows interactive features beyond simple tracking

## Caption Style Guide

- **Font:** Quicksand Semi-Bold (matches app) or system sans-serif as fallback
- **Size:** ~60px on iOS 6.7", ~56px on Android
- **Color:** White (#FFFFFF)
- **Position:** Centered horizontally, ~120px from top
- **Background:** Optional dark gradient overlay at top for readability
- **Case:** Sentence case

## Feature Graphic (Google Play only)

- **Dimensions:** 1024 x 500 px
- **Background:** Dark (#0F0F0F)
- **Layout:** App icon (256x256) centered-left at ~25% horizontal, tagline at ~60% horizontal
- **Tagline:** "Six habits. One longer life." in white, Quicksand Semi-Bold, ~48px
- **Accent:** Subtle glow using accent blue (#6C9CFF)
- **Subline:** "Free. Private. Science-backed." in #999999, ~24px

## How to Generate Screenshots (Chrome DevTools MCP)

### Prerequisites

1. Start the Expo dev server: `bun run web` from project root (port 8081)
2. Start a static file server: `python3 -m http.server 9000` from project root
3. Open Chrome to any page (Chrome DevTools MCP must be connected)

### Mockup Template

`fastlane/screenshots/mockup.html` — phone frame mockup with caption. It embeds the app via iframe.

- **Viewport:** 430x932 at 3x DPR (produces 1290x2796 final images — iPhone 6.7")
- **Design:** Light gray (#F2F2F7) background, dark caption text, dark phone frame with rounded corners, "ILLLL" subcaption below phone
- **Phone frame:** 380x842px with 48px border-radius, iframe scaled via `zoom: 0.8837` (430px app → 380px frame)
- **Caption:** Set via `?caption=` query param. Keep to one line (~25 chars) to avoid clipping the phone bottom
- **Path:** Set via `?path=` query param to navigate the iframe to a specific route

### Step-by-Step Capture Process

#### 1. Set up viewport emulation

```
emulate viewport: { width: 430, height: 932, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
emulate colorScheme: dark
```

#### 2. Seed app data via localStorage

The app's Zustand store is persisted in localStorage key `illll-storage\illll-store` (note the double backslash in the actual key: `illll-storage\\illll-store`).

Navigate to `http://localhost:8081` first, then set data:

```javascript
// Read current data
const raw = localStorage.getItem('illll-storage\\illll-store');
const data = JSON.parse(raw);

// Set dark mode
data.settings = data.settings || {};
data.settings.colorScheme = 'dark';

// Generate streak data (e.g., 35 days of habit completions)
const habits = ['breathing','light','food','sleep','exercise','gratitude'];
for (let i = 0; i < 35; i++) {
  const d = new Date();
  d.setDate(d.getDate() - i);
  const key = d.toISOString().split('T')[0];
  data.days = data.days || {};
  data.days[key] = data.days[key] || { habits: {} };
  // Set some/all habits as completed depending on screenshot needs
  habits.forEach(h => {
    data.days[key].habits[h] = { completed: true };
  });
}

localStorage.setItem('illll-storage\\illll-store', JSON.stringify(data));
```

Reload the page after setting localStorage.

#### 3. Navigate to mockup and capture

For simple screenshots (no in-app interaction needed):

```
navigate to: http://localhost:9000/fastlane/screenshots/mockup.html?caption=Track%20what%20actually%20matters
take_screenshot to: fastlane/screenshots/en-US/1_daily_hub_progress.png
```

For screenshots requiring in-app navigation (e.g., Progress tab):

```
navigate to: http://localhost:9000/fastlane/screenshots/mockup.html?caption=Watch%20your%20streaks%20grow&path=/progress
```

#### 4. Interactive screenshots (clicking inside iframe)

For screenshots that require clicking inside the app (e.g., opening settings, language picker, breathing bottom sheet), the iframe has `pointer-events: none` and `zoom: 0.8837` by default. To interact:

```javascript
// Step 1: Enable interaction (set zoom to 1 and enable pointer events)
const iframe = document.getElementById('app');
iframe.style.zoom = '1';
iframe.style.pointerEvents = 'auto';

// Step 2: Take a snapshot, find the target element, click it
// (use Chrome DevTools MCP take_snapshot + click)

// Step 3: Restore zoom after clicking
iframe.style.zoom = '';
iframe.style.pointerEvents = '';

// Step 4: Take screenshot
```

**Important:** Use CSS `zoom` (not `transform: scale()`) — transform causes a rendering shift when toggled and misaligns click coordinates.

### Modifying Habit Completion State Between Screenshots

To change which habits are completed (e.g., 3/6 for screenshot 1, then 6/6 for screenshot 2):

```javascript
// Navigate the iframe to localhost:8081 first, then evaluate inside it:
// Since cross-origin, set localStorage from the app's origin page directly.
// Navigate to http://localhost:8081, set localStorage, then navigate to mockup.

const raw = localStorage.getItem('illll-storage\\illll-store');
const data = JSON.parse(raw);
const today = new Date().toISOString().split('T')[0];

// Set specific habits as completed/not completed
data.days[today].habits.breathing = { completed: true };
data.days[today].habits.light = { completed: true };
data.days[today].habits.exercise = { completed: true };
data.days[today].habits.food = { completed: false };
data.days[today].habits.sleep = { completed: false };
data.days[today].habits.gratitude = { completed: false };

localStorage.setItem('illll-storage\\illll-store', JSON.stringify(data));
// Reload page to apply
```

**Cross-origin note:** localStorage must be set while on `localhost:8081` (same origin as the app). You cannot access the iframe's localStorage from the mockup page on `localhost:9000`. Navigate to `localhost:8081` to set data, then navigate to the mockup URL.

### Troubleshooting

- **App shows light mode:** Check `data.settings.colorScheme` is `'dark'` in localStorage. Interactive clicks (e.g., on settings) can accidentally hit the "Light" radio button — always verify colorScheme after interactions.
- **Tabs clipped at bottom:** Caption is too tall (2+ lines). Keep captions to ~25 characters / one line, or reduce `#phone-frame` height.
- **Content shifted after interaction:** Only use `zoom`, never `transform: scale()`. Clear inline styles after interaction with `iframe.style.zoom = ''`.
- **Can't click elements in iframe:** Set `iframe.style.zoom = '1'` and `iframe.style.pointerEvents = 'auto'` first. After clicking, clear both.
- **Wrong element clicked:** With zoom != 1, click coordinates may be wrong. Always set zoom to 1 before clicking.

### Optimize Images

After capturing all screenshots, optimize with sharp (lossless, ~45% size reduction):

```bash
bunx sharp -i fastlane/screenshots/en-US/*.png -o fastlane/screenshots/en-US/ --compressionLevel 9
```

This is lossless PNG recompression — no quality loss, just better encoding.

## Output Directory

Screenshots are saved to `fastlane/screenshots/en-US/`:

```
1_daily_hub_progress.png
2_daily_hub_complete.png
3_progress_streaks.png
4_habit_article.png
5_settings_languages.png
6_breathing_timer.png
```
