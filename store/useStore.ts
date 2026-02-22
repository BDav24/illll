import { create } from 'zustand';
import { format } from 'date-fns';
import { storage } from './mmkv';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type HabitId =
  | 'breathing'
  | 'light'
  | 'food'
  | 'sleep'
  | 'exercise'
  | 'gratitude';

export interface HabitEntry {
  completed: boolean;
  timestamp: number;
  data?: Record<string, unknown>;
}

export interface CustomHabit {
  id: string; // 'custom_' + uuid
  text: string;
}

export interface DayRecord {
  date: string; // 'YYYY-MM-DD'
  habits: Record<string, HabitEntry>; // accepts both core HabitId keys and 'custom_*' keys
}

export type ColorScheme = 'light' | 'dark' | 'auto';

export type NotificationSchedule =
  | { type: 'daily'; hour: number; minute: number }
  | { type: 'interval'; hours: number; minutes: number };

export interface UserNotification {
  id: string;
  title: string;
  body: string;
  schedule: NotificationSchedule;
  enabled: boolean;
  isDefault: boolean;
  defaultKey?: string;
}

export interface UserSettings {
  hiddenHabits: HabitId[];
  habitOrder: HabitId[];
  language: string | null; // null = auto-detect
  customHabits: CustomHabit[];
  colorScheme: ColorScheme;
  habitCriteria: Record<string, string>;
  notifications: UserNotification[];
}

// ---------------------------------------------------------------------------
// State & actions interface
// ---------------------------------------------------------------------------

interface StoreState {
  days: Record<string, DayRecord>;
  settings: UserSettings;

  // Actions
  toggleHabit: (habitId: HabitId) => void;
  updateHabitData: (habitId: HabitId, data: Record<string, unknown>) => void;
  addCustomHabit: (text: string) => void;
  deleteCustomHabit: (id: string) => void;
  toggleCustomHabit: (id: string) => void;
  toggleHideHabit: (habitId: HabitId) => void;
  setLanguage: (lang: string | null) => void;
  setHabitCriterion: (habitId: string, criterion: string) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  setNotifications: (notifications: UserNotification[]) => void;
  updateNotification: (id: string, updates: Partial<Omit<UserNotification, 'id'>>) => void;
  addNotification: (notification: UserNotification) => void;
  deleteNotification: (id: string) => void;
  toggleNotification: (id: string) => void;
  resetAll: () => void;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_HABIT_ORDER: HabitId[] = [
  'breathing',
  'light',
  'food',
  'sleep',
  'exercise',
  'gratitude',
];

const DEFAULT_SETTINGS: UserSettings = {
  hiddenHabits: [],
  habitOrder: DEFAULT_HABIT_ORDER,
  language: null,
  customHabits: [],
  colorScheme: 'light',
  habitCriteria: {},
  notifications: [],
};

// ---------------------------------------------------------------------------
// MMKV persistence helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'illll-store';

interface PersistedSlice {
  days: Record<string, DayRecord>;
  settings: UserSettings;
}

function loadState(): Partial<PersistedSlice> {
  try {
    const raw = storage.getString(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as Partial<PersistedSlice>;
    }
  } catch {
    // corrupted data – start fresh
  }
  return {};
}

function persistState(state: PersistedSlice): void {
  try {
    storage.set(
      STORAGE_KEY,
      JSON.stringify({ days: state.days, settings: state.settings }),
    );
  } catch {
    // silently ignore write errors
  }
}

// ---------------------------------------------------------------------------
// Helpers (exported for use in components)
// ---------------------------------------------------------------------------

export function getTodayKey(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function emptyDayRecord(date: string): DayRecord {
  return { date, habits: {} };
}

function ensureDay(
  days: Record<string, DayRecord>,
  date: string,
): Record<string, DayRecord> {
  if (days[date]) return days;
  return { ...days, [date]: { date, habits: {} } };
}

// ---------------------------------------------------------------------------
// Derived data helpers (use outside of selectors, e.g. in useMemo)
// ---------------------------------------------------------------------------

export function getVisibleHabits(settings: UserSettings): HabitId[] {
  return settings.habitOrder.filter(
    (id) => !settings.hiddenHabits.includes(id),
  );
}

export function getDayScore(
  day: DayRecord | undefined,
  visibleHabits: HabitId[],
  customHabits: CustomHabit[] = [],
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

export function getStreak(
  days: Record<string, DayRecord>,
  visibleHabits: HabitId[],
  customHabits: CustomHabit[] = [],
): number {
  let streak = 0;
  const now = new Date();
  // Start from yesterday (index 1) and go backwards
  for (let i = 1; ; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = format(d, 'yyyy-MM-dd');
    const day = days[key];

    if (!day) break;

    let completed = 0;
    for (const hid of visibleHabits) {
      if (day.habits[hid]?.completed) completed++;
    }
    for (const ch of customHabits) {
      if (day.habits[ch.id]?.completed) completed++;
    }

    if (completed > 0) {
      streak++;
    } else {
      break;
    }
  }

  // Also check today – if today has any completions, add it
  const todayRecord = days[getTodayKey()];
  if (todayRecord) {
    let todayCompleted = 0;
    for (const hid of visibleHabits) {
      if (todayRecord.habits[hid]?.completed) todayCompleted++;
    }
    for (const ch of customHabits) {
      if (todayRecord.habits[ch.id]?.completed) todayCompleted++;
    }
    if (todayCompleted > 0) {
      streak++;
    }
  }

  return streak;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

const persisted = loadState();

let persistTimeout: ReturnType<typeof setTimeout> | null = null;

export const useStore = create<StoreState>()((set) => ({
  days: persisted.days ?? {},
  settings: {
    ...DEFAULT_SETTINGS,
    ...(persisted.settings ?? {}),
    notifications: Array.isArray(persisted.settings?.notifications)
      ? persisted.settings.notifications
      : [],
  },

  // ----- mutations -----

  toggleHabit: (habitId: HabitId) => {
    const key = getTodayKey();
    set((state) => {
      const days = ensureDay(state.days, key);
      const day = days[key];
      const existing = day.habits[habitId];
      const wasCompleted = existing?.completed ?? false;

      const updatedHabits: Record<string, HabitEntry> = {
        ...day.habits,
        [habitId]: {
          completed: !wasCompleted,
          timestamp: Date.now(),
          data: existing?.data,
        },
      };

      return {
        days: {
          ...days,
          [key]: { ...day, habits: updatedHabits },
        },
      };
    });
  },

  updateHabitData: (habitId: HabitId, data: Record<string, unknown>) => {
    const key = getTodayKey();
    set((state) => {
      const days = ensureDay(state.days, key);
      const day = days[key];
      const existing = day.habits[habitId];

      const updatedHabits: Record<string, HabitEntry> = {
        ...day.habits,
        [habitId]: {
          ...existing,
          completed: true,
          timestamp: Date.now(),
          data: { ...(existing?.data ?? {}), ...data },
        },
      };

      return {
        days: {
          ...days,
          [key]: { ...day, habits: updatedHabits },
        },
      };
    });
  },

  addCustomHabit: (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const id = `custom_${crypto.randomUUID()}`;
    set((state) => ({
      settings: {
        ...state.settings,
        customHabits: [...state.settings.customHabits, { id, text: trimmed }],
      },
    }));
  },

  deleteCustomHabit: (id: string) => {
    set((state) => {
      const { [id]: _, ...remainingCriteria } = state.settings.habitCriteria;
      return {
        settings: {
          ...state.settings,
          customHabits: state.settings.customHabits.filter((h) => h.id !== id),
          habitCriteria: remainingCriteria,
        },
      };
    });
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

  toggleHideHabit: (habitId: HabitId) => {
    set((state) => {
      const hidden = state.settings.hiddenHabits;
      const isHidden = hidden.includes(habitId);
      return {
        settings: {
          ...state.settings,
          hiddenHabits: isHidden
            ? hidden.filter((id) => id !== habitId)
            : [...hidden, habitId],
        },
      };
    });
  },

  setLanguage: (lang: string | null) => {
    set((state) => ({
      settings: { ...state.settings, language: lang },
    }));
  },

  setHabitCriterion: (habitId: string, criterion: string) => {
    set((state) => {
      const updated = { ...state.settings.habitCriteria };
      if (criterion) {
        updated[habitId] = criterion;
      } else {
        delete updated[habitId];
      }
      return {
        settings: { ...state.settings, habitCriteria: updated },
      };
    });
  },

  setColorScheme: (scheme: ColorScheme) => {
    set((state) => ({
      settings: { ...state.settings, colorScheme: scheme },
    }));
  },

  setNotifications: (notifications: UserNotification[]) => {
    set((state) => ({
      settings: { ...state.settings, notifications },
    }));
  },

  updateNotification: (id: string, updates: Partial<Omit<UserNotification, 'id'>>) => {
    set((state) => ({
      settings: {
        ...state.settings,
        notifications: state.settings.notifications.map((n) =>
          n.id === id ? { ...n, ...updates, isDefault: false } : n,
        ),
      },
    }));
  },

  addNotification: (notification: UserNotification) => {
    set((state) => ({
      settings: {
        ...state.settings,
        notifications: [...state.settings.notifications, notification],
      },
    }));
  },

  deleteNotification: (id: string) => {
    set((state) => ({
      settings: {
        ...state.settings,
        notifications: state.settings.notifications.filter((n) => n.id !== id),
      },
    }));
  },

  toggleNotification: (id: string) => {
    set((state) => ({
      settings: {
        ...state.settings,
        notifications: state.settings.notifications.map((n) =>
          n.id === id ? { ...n, enabled: !n.enabled } : n,
        ),
      },
    }));
  },

  resetAll: () => {
    if (persistTimeout) {
      clearTimeout(persistTimeout);
      persistTimeout = null;
    }
    storage.clearAll();
    set({ days: {}, settings: { ...DEFAULT_SETTINGS } });
  },
}));

// ---------------------------------------------------------------------------
// Auto-persist: write to MMKV on every state change
// ---------------------------------------------------------------------------

let prevDays = useStore.getState().days;
let prevSettings = useStore.getState().settings;

useStore.subscribe((state) => {
  if (state.days !== prevDays || state.settings !== prevSettings) {
    prevDays = state.days;
    prevSettings = state.settings;
    if (persistTimeout) clearTimeout(persistTimeout);
    persistTimeout = setTimeout(
      () => persistState({ days: state.days, settings: state.settings }),
      300,
    );
  }
});
