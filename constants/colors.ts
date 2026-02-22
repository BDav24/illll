import { useColorScheme } from 'react-native';
import { useStore } from '../store/useStore';

const LightColors = {
  bg: '#FFFFFF',
  surface: '#F5F5F5',
  surfaceLight: '#EBEBEB',
  border: '#E0E0E0',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textMuted: '#767676',

  breathing: '#3A6FD4',
  light: '#AC8A24',
  food: '#33A066',
  sleep: '#7E50D0',
  exercise: '#CA4C4C',
  gratitude: '#C07428',

  accent: '#3A6FD4',
  success: '#2B8656',
  warning: '#AC8A24',
  danger: '#CA4C4C',

  heatmap: ['#F0F0F0', '#c6e6c6', '#8dd18d', '#52b852', '#2d9a2d'] as string[],

  ringBg: '#EBEBEB',
  ringFill: '#3A6FD4',

  checkmark: '#FFFFFF',
};

const DarkColors: typeof LightColors = {
  bg: '#0F0F0F',
  surface: '#1A1A1A',
  surfaceLight: '#252525',
  border: '#333333',
  text: '#FFFFFF',
  textSecondary: '#999999',
  textMuted: '#7B7B7B',

  breathing: '#6C9CFF',
  light: '#FFD666',
  food: '#66E0A0',
  sleep: '#B088F9',
  exercise: '#FF7A7A',
  gratitude: '#FFB366',

  accent: '#6C9CFF',
  success: '#66E0A0',
  warning: '#FFD666',
  danger: '#FF7A7A',

  heatmap: ['#1A1A1A', '#1a3a2a', '#2a5a3a', '#3a8a4a', '#4aCC5a'],

  ringBg: '#252525',
  ringFill: '#6C9CFF',

  checkmark: '#1A1A1A',
};

export type ColorPalette = typeof LightColors;

export function useColors(): ColorPalette {
  const colorScheme = useStore((s) => s.settings.colorScheme);
  const systemScheme = useColorScheme();
  const resolved = colorScheme === 'auto' ? (systemScheme ?? 'light') : colorScheme;
  return resolved === 'dark' ? DarkColors : LightColors;
}
