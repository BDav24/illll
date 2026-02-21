import { type HabitId } from '../store/useStore';

export interface HabitMeta {
  id: HabitId;
  icon: string;       // emoji
  color: string;      // from Colors
  i18nKey: string;    // for translations
  quickActionType: 'timer' | 'checkbox' | 'input' | 'timeRange' | 'text';
}

export const HABITS: HabitMeta[] = [
  { id: 'breathing', icon: '\u{1FAC1}', color: '#6C9CFF', i18nKey: 'habits.breathing', quickActionType: 'timer' },
  { id: 'light', icon: '\u2600\uFE0F', color: '#FFD666', i18nKey: 'habits.light', quickActionType: 'checkbox' },
  { id: 'food', icon: '\u{1F957}', color: '#66E0A0', i18nKey: 'habits.food', quickActionType: 'input' },
  { id: 'sleep', icon: '\u{1F634}', color: '#B088F9', i18nKey: 'habits.sleep', quickActionType: 'timeRange' },
  { id: 'exercise', icon: '\u{1F3C3}', color: '#FF7A7A', i18nKey: 'habits.exercise', quickActionType: 'input' },
  { id: 'gratitude', icon: '\u{1F64F}', color: '#FFB366', i18nKey: 'habits.gratitude', quickActionType: 'text' },
];

export const HABIT_MAP = Object.fromEntries(HABITS.map(h => [h.id, h])) as Record<HabitId, HabitMeta>;
