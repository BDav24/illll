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
  toggleHabit: (habitId: HabitId) => void;
  updateHabitData: (habitId: HabitId, data: Record<string, unknown>) => void;
  addTask: (text: string) => void;
  toggleTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  toggleHideHabit: (habitId: HabitId) => void;
  reorderHabits: (order: HabitId[]) => void;
  setLanguage: (lang: string | null) => void;
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
// Helpers (exported for use in components)
// ---------------------------------------------------------------------------

export function getTodayKey(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

const EMPTY_DAY_RECORDS = new Map<string, DayRecord>();

export function emptyDayRecord(date: string): DayRecord {
  let record = EMPTY_DAY_RECORDS.get(date);
  if (!record) {
    record = { date, habits: {}, tasks: [] };
    EMPTY_DAY_RECORDS.set(date, record);
  }
  return record;
}

function ensureDay(
  days: Record<string, DayRecord>,
  date: string,
): Record<string, DayRecord> {
  if (days[date]) return days;
  return { ...days, [date]: { date, habits: {}, tasks: [] } };
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
): { completed: number; total: number } {
  if (!day) return { completed: 0, total: 0 };

  let completed = 0;
  const total = visibleHabits.length + day.tasks.length;

  for (const hid of visibleHabits) {
    if (day.habits[hid]?.completed) completed++;
  }
  for (const task of day.tasks) {
    if (task.completed) completed++;
  }

  return { completed, total };
}

export function getStreak(
  days: Record<string, DayRecord>,
  visibleHabits: HabitId[],
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
  const todayRecord = days[getTodayKey()];
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
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

const persisted = loadState();

export const useStore = create<StoreState>()((set) => ({
  days: persisted.days ?? {},
  settings: {
    ...DEFAULT_SETTINGS,
    ...(persisted.settings ?? {}),
  },

  // ----- mutations -----

  toggleHabit: (habitId: HabitId) => {
    const key = getTodayKey();
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
    const key = getTodayKey();
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
    const key = getTodayKey();
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
    const key = getTodayKey();
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
    const key = getTodayKey();
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
    persistState({ days: state.days, settings: state.settings });
  }
});
