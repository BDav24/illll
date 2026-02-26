import { type HabitId } from '../store/useStore';

export interface HabitMeta {
  id: HabitId;
  icon: string;       // emoji
  quickActionType: 'timer' | 'checkbox' | 'input' | 'timeRange' | 'text';
}

export const HABITS: HabitMeta[] = [
  { id: 'sleep', icon: '\u{1F634}', quickActionType: 'timeRange' },
  { id: 'exercise', icon: '\u{1F3C3}', quickActionType: 'input' },
  { id: 'breathing', icon: '\u{1FAC1}', quickActionType: 'timer' },
  { id: 'light', icon: '\u2600\uFE0F', quickActionType: 'checkbox' },
  { id: 'food', icon: '\u{1F957}', quickActionType: 'input' },
  { id: 'gratitude', icon: '\u{1F64F}', quickActionType: 'text' },
];

export const HABIT_MAP = Object.fromEntries(HABITS.map(h => [h.id, h])) as Record<HabitId, HabitMeta>;
