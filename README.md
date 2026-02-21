# ILLLL - I'll Live Longer

A beautifully designed React Native mobile app focused on evidence-based longevity habits. Track daily wellness practices with an intuitive interface, streaks, and progress visualization.

## Features

### Core Habits
- **Breathing Exercises** - Guided breathing timer for nervous system regulation
- **Light Exposure** - Morning sunlight tracking for circadian rhythm
- **Healthy Food** - Nutritious meal logging
- **Sleep** - Sleep time tracking and insights
- **Exercise** - Daily movement tracking
- **Gratitude** - Daily gratitude journaling

### Key Features
- 📊 **Daily Score** - Track completion of habits and tasks
- 🔥 **Streak Tracking** - Build momentum with consecutive days
- 📈 **Progress Charts** - Visualize your progress with weekly charts and yearly heatmaps
- ✅ **Custom Tasks** - Add your own daily to-dos
- 🌍 **Multi-language** - Support for 20+ languages including English, Spanish, French, German, Chinese, Japanese, Arabic, and more
- 🎨 **Dark/Light Mode** - Automatic theme adaptation
- 📚 **Educational Articles** - Learn the science behind each habit

## Tech Stack

- **Framework**: React Native (0.81.5) with Expo (54.x)
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand
- **Storage**: MMKV (fast, encrypted key-value storage)
- **Internationalization**: i18next + react-i18next
- **UI Components**:
  - React Native Reanimated
  - React Native Gesture Handler
  - Gorhom Bottom Sheet
- **Date/Time**: date-fns
- **Charts**: React Native SVG

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd illl

# Install dependencies
bun install
# or
npm install

# Start the development server
bun start
# or
npm start
```

### Running the App

```bash
# iOS
bun ios

# Android
bun android

# Web
bun web
```

## Project Structure

```
illl/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Daily Hub (main screen)
│   │   └── progress.tsx   # Progress tracking
│   ├── habit/[id].tsx     # Habit detail/article screen
│   └── settings.tsx       # Settings screen
├── components/            # Reusable UI components
│   ├── DailyScore.tsx
│   ├── StreakBadge.tsx
│   ├── HabitCard.tsx
│   ├── TaskItem.tsx
│   ├── Heatmap.tsx
│   └── ...
├── constants/             # App constants and configuration
│   ├── habits.ts          # Habit definitions
│   ├── colors.ts          # Color palette
│   └── articles.ts        # Educational content
├── store/                 # State management
│   ├── useStore.ts        # Zustand store
│   └── mmkv.ts           # MMKV storage setup
├── locales/              # Translation files (20+ languages)
│   ├── en.json
│   ├── es.json
│   └── ...
└── lib/                  # Utilities
    └── i18n.ts           # i18n configuration
```

## Key Concepts

### Daily Hub
The main screen where users see their greeting, daily score, current streak, all visible habits, and custom tasks.

### Habits
Six core science-backed longevity practices. Each habit has:
- Icon and color
- One-liner explanation
- Quick action type (timer, checkbox, input, etc.)
- Detailed article with research and recommendations

### Progress Tracking
- **Streaks**: Consecutive days of completing at least one task/habit
- **Weekly Chart**: Bar chart showing daily completion rates
- **Yearly Heatmap**: GitHub-style contribution heatmap for the year
- **Completion Rate**: Percentage of completed vs. total items

### Data Storage
All user data is stored locally using MMKV for privacy and performance. Data structure:
- Daily entries keyed by date (YYYY-MM-DD)
- Habit completion states and metadata
- Custom tasks
- User preferences and settings

## Configuration

### Adding a New Language

1. Create a new JSON file in `locales/` (e.g., `locales/sv.json`)
2. Copy the structure from `locales/en.json`
3. Translate all strings
4. The app will auto-detect based on device language or users can manually select in settings

### Customizing Habits

Edit `constants/habits.ts` to modify habit metadata, colors, or icons.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Version

Current version: 1.0.0
