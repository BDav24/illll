# ILLLL Test Plan

Manual test plan for verifying all features via Chrome DevTools MCP on web (`http://localhost:8081`).

## Prerequisites

1. Start Expo web server: `bun run web`
2. Navigate browser to `http://localhost:8081`

### Known Web Quirks

- Click timeouts are expected on React Native web — the click still registers. Always verify via snapshot/screenshot after clicks.
- Bottom sheet content (Gorhom) doesn't appear in the a11y tree on web. Use screenshots and `evaluate_script` to interact with sheet content.
- `+html.tsx` CSS is only applied in production builds, not dev server.
- Notification permissions always succeed on web (no native push).

## 1. Daily Hub (main screen)

### 1.1 Layout & Data

- [ ] Greeting shows correct time-of-day (morning/afternoon/evening)
- [ ] Date displays correctly
- [ ] Score ring shows `X of Y` (visible habits + custom habits)
- [ ] Streak badge displays with fire emoji and count
- [ ] All visible core habits render with icon, name, one-liner, info button, checkbox
- [ ] Custom habits render below core habits with name and checkbox
- [ ] Settings gear icon visible in streak row

### 1.2 Habit Toggling

- [ ] Toggle a core habit checkbox — score updates (e.g. 0/7 → 1/7)
- [ ] Toggle a custom habit checkbox — score updates
- [ ] Toggle all habits to complete — "All done for today!" message appears
- [ ] "All done" has `role="alert"` and `aria-live="polite"`
- [ ] Uncheck a habit — "All done" disappears, score decreases

### 1.3 Bottom Sheet

- [ ] Click a core habit card — bottom sheet opens (verify via screenshot)
- [ ] Sheet shows: habit icon, name heading, "WHAT TO DO" recommendation, "MY GOAL" criterion, one-liner, action button
- [ ] Click action button (e.g. "Log sleep times") — habit toggles and sheet closes
- [ ] For Breathing habit: breathing timer appears with circle, tap-to-start text
- [ ] "Why [Habit]?" link is visible at bottom of sheet

### 1.4 Criterion Editing

- [ ] Click "MY GOAL" card — text input appears with current criterion
- [ ] Type new criterion and submit — saves and displays
- [ ] "Reset to default" button resets to translation default

## 2. Habit Article Screen

- [ ] Click "Why [Habit]?" or info (?) button — article modal opens
- [ ] Shows: close button, habit icon (large), "Why [Habit]?" heading
- [ ] TL;DR card with summary text
- [ ] Body text with scientific explanations
- [ ] "Studies" section with 3 academic references (authors, title, journal, year, DOI link)
- [ ] Close button returns to previous screen

## 3. Progress Screen

- [ ] Navigate to Progress tab
- [ ] Current Streak card shows correct number + "days" label
- [ ] Best Streak card shows correct number + "days" label
- [ ] "Last 7 Days" section with weekly line chart and completion rate percentage
- [ ] "This Year [YYYY]" section with heatmap grid (green cells for active days)
- [ ] Charts have `role="image"` with accessible labels

## 4. Settings Screen

- [ ] Click settings gear — modal opens with close (x) button
- [ ] **HABITS section**: All 6 core habits listed with toggle switches
- [ ] Toggle a habit off — returns to Daily Hub, habit is hidden
- [ ] Toggle back on — habit reappears
- [ ] **MY HABITS section**: Custom habits listed with delete (x) buttons
- [ ] Type in "Add a habit..." input and click (+) — new custom habit appears
- [ ] Click delete (x) on custom habit — confirm dialog appears, accept deletes it
- [ ] **LANGUAGE section**: Shows current language with expand arrow
- [ ] Click to expand — all 20 languages + Auto-detect listed as radio buttons
- [ ] Select a non-English language (e.g. Japanese) — all UI text translates
- [ ] Switch back to English — UI reverts
- [ ] **THEME section**: Light / Dark / Auto radio buttons
- [ ] Select Dark — entire UI switches to dark color palette
- [ ] Select Light — UI reverts to light palette
- [ ] **ABOUT section**: Shows "Version X.X.X"
- [ ] "Reset All Data" button visible (DO NOT click unless testing reset)

## 5. Reminders Screen

- [ ] Navigate to `/reminders` (or via settings link)
- [ ] **Empty state**: Shows bell icon, description text, "Add reminder" button (if no reminders exist)
- [ ] **Default reminders**: 3 defaults (Morning Routine, Evening Wind-Down, Time to Move) if seeded
- [ ] Each reminder card shows: title, body preview, schedule label, toggle switch, Edit/Delete buttons
- [ ] **Toggle switch**: Enables/disables reminder (requests notification permission on first enable)
- [ ] **Edit**: Click Edit — inline editor replaces card with pre-filled title, body, schedule type, time
- [ ] **Delete**: Click Delete — confirm dialog, accept removes reminder
- [ ] **Add reminder**: Click "+ Add reminder" — editor appears at bottom
  - [ ] Title input required (Save disabled when empty)
  - [ ] Daily mode: hour/minute steppers with +/- buttons
  - [ ] Interval mode: hours/minutes steppers
  - [ ] **0h 0m validation**: Set interval to 0 hours, 0 minutes — Save button is DISABLED
  - [ ] Increase to any non-zero value — Save button re-enables
  - [ ] Cancel button dismisses editor without saving

## 6. Dark Mode & Theming

- [ ] In settings, select Dark theme
- [ ] Background changes to near-black (#0F0F0F)
- [ ] Text changes to white
- [ ] Cards/surfaces use dark surface color (#1A1A1A)
- [ ] Habit colors use brighter variants (e.g. breathing blue -> #6C9CFF)
- [ ] Accent colors visible and readable
- [ ] Navigate to Progress — dark mode persists across screens
- [ ] Switch back to Light theme — everything reverts

## 7. Data Persistence

- [ ] Complete some habits, add a custom habit
- [ ] Reload the page (or restart dev server)
- [ ] All data persists: completed habits, custom habits, settings, reminders

## 8. Accessibility Spot-Check

- [ ] Habit cards have `role="button"` with accessible names
- [ ] Checkboxes have `role="checkbox"` with checked/unchecked state
- [ ] Headings use `role="header"` (h1)
- [ ] Score ring has `role="progressbar"` with value
- [ ] Decorative elements have `importantForAccessibility="no"`
- [ ] Charts have `role="image"` with descriptive labels

## 9. Console Errors

- [ ] Check console for errors and warnings
- [ ] No app-level errors (Gorhom bottom sheet aria-hidden warning on web is known/acceptable)
