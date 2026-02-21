# ILLLL - Product Specification

## Vision

ILLLL (I'll Live Longer) empowers people to live healthier, longer lives by making evidence-based longevity habits accessible, trackable, and sustainable. We focus on the fundamentals that science has proven to matter most.

## Product Principles

1. **Evidence-Based**: Every habit is backed by scientific research
2. **Simplicity First**: No complexity, no bloat, just what works
3. **Privacy-Focused**: All data stays on the user's device
4. **Beautiful & Delightful**: Design that motivates daily use
5. **Accessible**: Multi-language, intuitive for all ages

## Target Users

### Primary Audience

- Health-conscious individuals (25-55 years old)
- People interested in longevity and preventive health
- Users who value simplicity over feature-bloat
- Privacy-conscious individuals

### User Goals

- Build sustainable healthy habits
- Track progress without overwhelming complexity
- Understand the "why" behind each practice
- Maintain motivation through streaks and visualization

## Core Features

### 1. Daily Hub (Main Screen)

**Purpose**: Central dashboard for daily habit tracking and task management.

**Components**:

- **Greeting**: Time-appropriate greeting with current date
- **Daily Score**: Circular progress indicator showing completed/total items
- **Streak Badge**: Current consecutive days streak
- **Habit Cards**: 6 core longevity habits (can be hidden in settings)
  - Each shows icon, name, completion state
  - Tap to mark complete
  - Info button for quick action or details
- **Custom Tasks**: User-created to-do items
- **All Done Celebration**: Shown when 100% complete

**User Flow**:

1. User opens app → sees greeting and today's score
2. Taps habit card → marks it complete (instant haptic feedback)
3. OR taps info button → opens bottom sheet with quick action
4. Adds custom tasks as needed throughout the day
5. Completes all items → sees celebration message

### 2. Six Core Habits

Each habit represents a fundamental longevity practice:

#### 2.1 Breathing

- **Icon**: 🫁
- **Color**: Blue (#6C9CFF)
- **Quick Action**: Interactive breathing timer
  - 4s inhale, 4s hold, 8s exhale pattern
  - Rounds counter
  - Visual guide with animations
- **Science**: Activates parasympathetic nervous system, reduces stress
- **Data Tracked**: Duration, number of rounds

#### 2.2 Light Exposure

- **Icon**: ☀️
- **Color**: Yellow (#FFD666)
- **Quick Action**: Simple checkbox
- **Science**: Sets circadian rhythm, improves sleep and mood
- **Recommendation**: 10-30 minutes of morning sunlight

#### 2.3 Healthy Food

- **Icon**: 🥗
- **Color**: Green (#66E0A0)
- **Quick Action**: Text input for meal description
- **Science**: Nutrition is foundational to all bodily functions
- **Focus**: Whole foods, vegetables, lean proteins, healthy fats

#### 2.4 Sleep

- **Icon**: 😴
- **Color**: Purple (#B088F9)
- **Quick Action**: Time range input (bedtime → wake time)
- **Science**: Brain detoxification, memory consolidation, cellular repair
- **Recommendation**: 7-9 hours of quality sleep

#### 2.5 Exercise

- **Icon**: 🏃
- **Color**: Red (#FF7A7A)
- **Quick Action**: Input field for activity and duration
- **Science**: #1 antidepressant, improves cardiovascular health, longevity
- **Recommendation**: 150+ minutes moderate activity per week

#### 2.6 Gratitude

- **Icon**: 🙏
- **Color**: Orange (#FFB366)
- **Quick Action**: Text area for gratitude entries
- **Science**: Rewires brain toward positivity, reduces depression
- **Practice**: Write 3 good things that happened today

### 3. Progress Tracking

**Purpose**: Visualize long-term patterns and maintain motivation.

**Components**:

- **Current Streak**: Consecutive days with at least 1 completion
- **Best Streak**: Personal record
- **Weekly Chart**: Bar chart showing daily completion percentage
  - Last 7 days
  - Interactive (tap to see date)
- **Yearly Heatmap**: GitHub-style contribution grid
  - Shows entire year at a glance
  - Color intensity based on completion rate
  - Tap cell to see date details

**Metrics**:

- Completion rate: `completed / total * 100`
- Streak: consecutive days with `completed >= 1`
- Breaks on days with zero completions

### 4. Habit Details & Education

**Purpose**: Help users understand WHY each habit matters.

**Components**:

- Habit name and icon
- One-liner explanation
- **TL;DR**: Quick summary of benefits
- **Studies**: Key research findings with citations
- **Recommendation**: Actionable advice on how to practice

**Content Strategy**:

- Keep articles short (< 500 words)
- Link to primary research when possible
- Focus on practical application
- Avoid medical claims, stick to general wellness

### 5. Custom Tasks

**Purpose**: Allow users to track personal daily goals beyond the core habits.

**Features**:

- Add unlimited tasks
- Mark complete/incomplete
- Delete tasks
- Tasks reset each day (not recurring yet)

**Use Cases**:

- "Drink 8 glasses of water"
- "Read 30 minutes"
- "Call mom"
- "Meditate 10 minutes"

### 6. Settings

**Purpose**: Personalize the app experience.

**Options**:

- **Habits**: Show/hide individual habits
- **Notifications**: Enable/disable reminders (future)
- **Language**: Choose from 20+ languages or auto-detect
- **About**: Version info, credits
- **Reset Data**: Nuclear option to start fresh (with confirmation)

## Data Model

### Storage Technology

- **MMKV**: Fast, encrypted key-value storage
- All data stored locally (no cloud sync)

### Data Structure

```typescript
// Store state
{
  // User preferences
  preferences: {
    language: 'en' | 'es' | ... | 'auto',
    hiddenHabits: string[], // habit IDs to hide
  },

  // Daily entries, keyed by YYYY-MM-DD
  dailyEntries: {
    '2024-01-15': {
      date: '2024-01-15',
      habits: {
        breathing: {
          completed: true,
          data: { duration: 48, rounds: 3 }
        },
        light: { completed: true },
        food: {
          completed: true,
          data: { description: 'Salmon salad' }
        },
        sleep: {
          completed: false,
          data: { bedtime: '23:00', wakeTime: '07:00' }
        },
        exercise: {
          completed: true,
          data: { activity: 'Running', duration: 30 }
        },
        gratitude: {
          completed: true,
          data: { text: 'Grateful for...' }
        }
      },
      tasks: [
        { id: 'uuid', text: 'Drink water', completed: true },
        { id: 'uuid', text: 'Call mom', completed: false }
      ]
    }
  }
}
```

### Computed Values

**Daily Score**:

```typescript
const total = visibleHabits.length + tasks.length;
const completed =
  visibleHabits.filter(h => habits[h]?.completed).length +
  tasks.filter(t => t.completed).length;
```

**Streak**:

```typescript
// Starting from today, count backwards consecutive days
// where completed >= 1
// Break on first day with completed === 0 or missing entry
```

**Weekly Data**: Last 7 days of daily scores

**Yearly Data**: All 365 days, fill missing with 0%

## User Flows

### First Launch

1. App opens → shows Daily Hub
2. All 6 habits visible, score 0/6
3. No streak (0 days)
4. Empty custom tasks section
5. User can immediately start completing habits

### Daily Routine

1. Morning: User checks app, sees greeting
2. Completes morning sunlight → taps light habit
3. Throughout day: adds and completes custom tasks
4. Does breathing exercise → opens timer, completes rounds
5. Evening: logs dinner, exercise, sleep plan
6. Before bed: writes gratitude
7. Score reaches 100% → sees celebration
8. Streak increments next day

### Week Review

1. User navigates to Progress tab
2. Sees current 5-day streak
3. Weekly chart shows consistent 80%+ completion
4. Feels motivated to continue

### Language Change

1. User opens Settings
2. Taps Language
3. Selects new language (e.g., Spanish)
4. Entire app updates immediately
5. All habits, UI, articles now in Spanish

## Technical Architecture

### App Structure

```
Entry Point (index.ts)
  ↓
Expo Router (_layout.tsx)
  ↓
├─ (tabs)/_layout.tsx          → Tab Navigation
│   ├─ index.tsx               → Daily Hub
│   └─ progress.tsx            → Progress Screen
├─ habit/[id].tsx              → Habit Article (modal)
└─ settings.tsx                → Settings Screen
```

### State Flow

```
User Action (e.g., tap habit)
  ↓
Component calls store method (toggleHabit)
  ↓
Zustand updates state
  ↓
MMKV persists change
  ↓
Components re-render with new state
  ↓
UI updates (haptic feedback, animation)
```

### Dependencies

- **Expo SDK 54**: Platform foundation
- **React Native 0.81**: UI framework
- **TypeScript 5.9**: Type safety
- **Zustand**: State management (lightweight, performant)
- **MMKV**: Storage (10x faster than AsyncStorage)
- **i18next**: Internationalization
- **date-fns**: Date manipulation
- **Reanimated**: Animations
- **Bottom Sheet**: Modal interactions

## Performance Requirements

- **Launch Time**: < 2 seconds on mid-range devices
- **Interaction Response**: < 100ms (immediate haptic feedback)
- **Animation Framerate**: 60fps for all transitions
- **Storage**: < 5MB for years of data
- **Memory**: < 100MB RAM usage

## Accessibility (Future)

- VoiceOver/TalkBack support
- Larger text options
- High contrast mode
- Screen reader-friendly navigation
- Minimum touch target: 44x44pt

## Internationalization

### Supported Languages (20+)

- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Portuguese Brazilian (pt-BR)
- Italian (it)
- Dutch (nl)
- Polish (pl)
- Russian (ru)
- Turkish (tr)
- Chinese Simplified (zh-Hans)
- Chinese Traditional (zh-Hant)
- Japanese (ja)
- Korean (ko)
- Arabic (ar)
- Hindi (hi)
- Bengali (bn)
- Vietnamese (vi)
- Thai (th)
- Indonesian (id)

### RTL Support

- Arabic and other RTL languages supported
- UI automatically flips for RTL
- Text alignment adapts

## Future Roadmap

### V1.1 - Insights & Habits

- [ ] Notifications for daily reminders
- [ ] Allow updating past entries (e.g., forgot to log yesterday)
- [ ] Insights based on patterns ("You complete exercise 80% more when you do morning light!")

### V1.2 - Social & Sharing

- [ ] Share progress images
- [ ] Accountability partners (optional)
- [ ] Anonymous community challenges

### V1.3 - Data & Export

- [ ] Export data to CSV
- [ ] Backup/restore (iCloud, Google Drive)
- [ ] Advanced analytics dashboard

### V2.0 - Personalization

- [ ] Habit goals (e.g., "Exercise 5x/week")
- [ ] Smart recommendations based on behavior
- [ ] Integration with Health app (iOS) / Google Fit (Android)

### Long-term Ideas

- [ ] Wearable integration (Apple Watch, etc.)
- [ ] Journaling features
- [ ] Meditation timer
- [ ] Water intake tracking
- [ ] Supplement/medication reminders
- [ ] Sleep analysis
- [ ] Meal photo logging

## Success Metrics

### Engagement

- **Daily Active Users (DAU)**: % of users who open app daily
- **Streak Retention**: % of users maintaining 7+ day streaks
- **Habit Completion Rate**: Average % of habits completed per day

### Quality

- **Crash Rate**: < 0.1%
- **Load Time**: < 2s on P50 devices
- **App Rating**: 4.5+ stars

### Growth

- **Retention**: 40%+ D7, 20%+ D30
- **Virality**: Organic shares, word-of-mouth
- **Reviews**: Positive qualitative feedback

## Design Philosophy

### Visual Design

- **Minimalist**: Clean, uncluttered interface
- **Dark Mode First**: Optimized for evening use
- **Vibrant Accents**: Each habit has a distinct, pleasant color
- **Smooth Animations**: Micro-interactions that delight
- **Typography**: Clear hierarchy, readable fonts

### UX Principles

- **Zero Friction**: Complete a habit in 1 tap
- **Immediate Feedback**: Haptics, animations, sound (optional)
- **Forgiving**: Easy to undo, no penalties
- **Progressive Disclosure**: Simple by default, powerful if you dig
- **Consistent**: Patterns repeat across the app

### Content Voice

- **Encouraging**: Positive, never judgmental
- **Scientific**: Evidence-based, credible
- **Concise**: Respect user's time
- **Actionable**: Clear next steps
- **Humble**: We're here to help, not preach

## Privacy & Security

- **No Account Required**: Use immediately
- **No Data Collection**: Zero analytics, tracking, or telemetry
- **Local Storage**: Everything stays on device
- **No Ads**: Clean, distraction-free experience
- **Open Source**: Build trust through transparency

## Platform Support

### Current

- iOS 13+
- Android 8.0+
- Web

### Future

- iPad optimization
- macOS (Catalyst)
- Apple Watch
- Android Wear

## Constraints & Considerations

- **Offline-Only**: No server infrastructure (keeps costs zero)
- **No Sync**: Data doesn't transfer between devices (trade-off for privacy)
- **Static Content**: Articles and habits are app-bundled (not dynamic)
- **Battery Life**: Minimize background processes, respect device resources

---

## Appendix: Research References

### Breathing

- Gerritsen & Band (2018). "Breath of Life: The Respiratory Vagal Stimulation Model of Contemplative Activity"
- Ma et al. (2017). "The Effect of Diaphragmatic Breathing on Attention, Negative Affect and Stress"

### Light Exposure

- Rosenthal et al. (2016). "Light Therapy for Seasonal Affective Disorder"
- Wright et al. (2013). "Entrainment of the Human Circadian Clock to the Natural Light-Dark Cycle"

### Nutrition

- Schwingshackl & Hoffmann (2015). "Diet Quality and Mortality"
- Sofi et al. (2014). "Mediterranean Diet and Health Status: An Updated Meta-Analysis"

### Sleep

- Walker (2017). "Why We Sleep: Unlocking the Power of Sleep and Dreams"
- Xie et al. (2013). "Sleep Drives Metabolite Clearance from the Adult Brain"

### Exercise

- Warburton et al. (2006). "Health Benefits of Physical Activity"
- Pedersen & Saltin (2015). "Exercise as Medicine"

### Gratitude

- Emmons & McCullough (2003). "Counting Blessings Versus Burdens"
- Wood et al. (2010). "Gratitude and Well-Being: A Review"

---

**Document Version**: 1.0
**Last Updated**: 2024-01-15
**Status**: Living Document (subject to change)
