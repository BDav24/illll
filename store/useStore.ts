import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
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

export interface CustomTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface DayRecord {
  date: string; // 'YYYY-MM-DD'
  habits: Partial<Record<HabitId, HabitEntry>>;
  tasks: CustomTask[];
}

export interface NotificationSetting {
  enabled: boolean;
  hour: number;
  minute: number;
}

export interface UserSettings {
  hiddenHabits: HabitId[];
  habitOrder: HabitId[];
  notifications: Partial<Record<HabitId, NotificationSetting>>;
  language: string | null; // null = auto-detect
}

// ---------------------------------------------------------------------------
// State & actions interface
// ---------------------------------------------------------------------------

interface StoreState {
  days: Record<string, DayRecord>;
  settings: UserSettings;

  // Actions
  getToday: () => DayRecord;
  getTodayKey: () => string;
  toggleHabit: (habitId: HabitId) => void;
  updateHabitData: (habitId: HabitId, data: Record<string, unknown>) => void;
  addTask: (text: string) => void;
  toggleTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  getVisibleHabits: () => HabitId[];
  getDayScore: (date: string) => { completed: number; total: number };
  getStreak: () => number;
  toggleHideHabit: (habitId: HabitId) => void;
  reorderHabits: (order: HabitId[]) => void;
  setLanguage: (lang: string | null) => void;
  getDayRecord: (date: string) => DayRecord;
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
  notifications: {},
  language: null,
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
// Helpers
// ---------------------------------------------------------------------------

function todayKey(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

function emptyDayRecord(date: string): DayRecord {
  return { date, habits: {}, tasks: [] };
}

function ensureDay(
  days: Record<string, DayRecord>,
  date: string,
): Record<string, DayRecord> {
  if (days[date]) return days;
  return { ...days, [date]: emptyDayRecord(date) };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

const persisted = loadState();

export const useStore = create<StoreState>()(
  subscribeWithSelector((set, get) => {
    // Build initial state by merging persisted data with defaults
    const initialState: StoreState = {
      days: persisted.days ?? {},
      settings: {
        ...DEFAULT_SETTINGS,
        ...(persisted.settings ?? {}),
      },

      // ----- read-only / computed helpers -----

      getTodayKey: () => todayKey(),

      getToday: () => {
        const key = todayKey();
        const { days } = get();
        if (days[key]) return days[key];
        const record = emptyDayRecord(key);
        // Materialise the record so subsequent reads don't keep creating new objects
        set((s) => ({ days: { ...s.days, [key]: record } }));
        return record;
      },

      getDayRecord: (date: string) => {
        const { days } = get();
        if (days[date]) return days[date];
        const record = emptyDayRecord(date);
        set((s) => ({ days: { ...s.days, [date]: record } }));
        return record;
      },

      getVisibleHabits: () => {
        const { settings } = get();
        return settings.habitOrder.filter(
          (id) => !settings.hiddenHabits.includes(id),
        );
      },

      getDayScore: (date: string) => {
        const { days, settings } = get();
        const day = days[date];
        if (!day) return { completed: 0, total: 0 };

        const visibleHabits = settings.habitOrder.filter(
          (id) => !settings.hiddenHabits.includes(id),
        );

        let completed = 0;
        let total = visibleHabits.length + day.tasks.length;

        for (const hid of visibleHabits) {
          if (day.habits[hid]?.completed) completed++;
        }
        for (const task of day.tasks) {
          if (task.completed) completed++;
        }

        return { completed, total };
      },

      getStreak: () => {
        const { days, settings } = get();
        const visibleHabits = settings.habitOrder.filter(
          (id) => !settings.hiddenHabits.includes(id),
        );

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
          for (const task of day.tasks) {
            if (task.completed) completed++;
          }

          if (completed > 0) {
            streak++;
          } else {
            break;
          }
        }

        // Also check today – if today has any completions, add it
        const todayRecord = days[todayKey()];
        if (todayRecord) {
          let todayCompleted = 0;
          for (const hid of visibleHabits) {
            if (todayRecord.habits[hid]?.completed) todayCompleted++;
          }
          for (const task of todayRecord.tasks) {
            if (task.completed) todayCompleted++;
          }
          if (todayCompleted > 0) {
            streak++;
          }
        }

        return streak;
      },

      // ----- mutations -----

      toggleHabit: (habitId: HabitId) => {
        const key = todayKey();
        set((state) => {
          const days = ensureDay(state.days, key);
          const day = days[key];
          const existing = day.habits[habitId];
          const wasCompleted = existing?.completed ?? false;

          const updatedHabits: Partial<Record<HabitId, HabitEntry>> = {
            ...day.habits,
            [habitId]: {
              ...existing,
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
        const key = todayKey();
        set((state) => {
          const days = ensureDay(state.days, key);
          const day = days[key];
          const existing = day.habits[habitId];

          const updatedHabits: Partial<Record<HabitId, HabitEntry>> = {
            ...day.habits,
            [habitId]: {
              completed: true,
              timestamp: Date.now(),
              ...existing,
              data: { ...(existing?.data ?? {}), ...data },
            },
          };

          // Ensure completed is true after spread
          (updatedHabits[habitId] as HabitEntry).completed = true;
          (updatedHabits[habitId] as HabitEntry).timestamp = Date.now();

          return {
            days: {
              ...days,
              [key]: { ...day, habits: updatedHabits },
            },
          };
        });
      },

      addTask: (text: string) => {
        const key = todayKey();
        set((state) => {
          const days = ensureDay(state.days, key);
          const day = days[key];
          const newTask: CustomTask = {
            id: crypto.randomUUID(),
            text,
            completed: false,
          };
          return {
            days: {
              ...days,
              [key]: { ...day, tasks: [...day.tasks, newTask] },
            },
          };
        });
      },

      toggleTask: (taskId: string) => {
        const key = todayKey();
        set((state) => {
          const days = ensureDay(state.days, key);
          const day = days[key];
          const tasks = day.tasks.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t,
          );
          return {
            days: {
              ...days,
              [key]: { ...day, tasks },
            },
          };
        });
      },

      deleteTask: (taskId: string) => {
        const key = todayKey();
        set((state) => {
          const days = ensureDay(state.days, key);
          const day = days[key];
          const tasks = day.tasks.filter((t) => t.id !== taskId);
          return {
            days: {
              ...days,
              [key]: { ...day, tasks },
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

      reorderHabits: (order: HabitId[]) => {
        set((state) => ({
          settings: { ...state.settings, habitOrder: order },
        }));
      },

      setLanguage: (lang: string | null) => {
        set((state) => ({
          settings: { ...state.settings, language: lang },
        }));
      },
    };

    return initialState;
  }),
);

// ---------------------------------------------------------------------------
// Auto-persist: write to MMKV on every state change
// ---------------------------------------------------------------------------

useStore.subscribe(
  (state) => ({ days: state.days, settings: state.settings }),
  (slice) => {
    persistState(slice);
  },
  { equalityFn: Object.is },
);
