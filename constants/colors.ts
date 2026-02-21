import { useColorScheme } from 'react-native';
import { useStore } from '../store/useStore';

const LightColors = {
  bg: '#FFFFFF',
  surface: '#F5F5F5',
  surfaceLight: '#EBEBEB',
  border: '#E0E0E0',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textMuted: '#999999',

  breathing: '#4A7FE5',
  light: '#E5B830',
  food: '#3DBF7A',
  sleep: '#9060E0',
  exercise: '#E05555',
  gratitude: '#E08A30',

  accent: '#4A7FE5',
  success: '#3DBF7A',
  warning: '#E5B830',
  danger: '#E05555',

  heatmap: ['#F0F0F0', '#c6e6c6', '#8dd18d', '#52b852', '#2d9a2d'] as string[],

  ringBg: '#EBEBEB',
  ringFill: '#4A7FE5',

  // Checkmark on colored backgrounds — always white
  checkmark: '#FFFFFF',
};

const DarkColors: typeof LightColors = {
  bg: '#0F0F0F',
  surface: '#1A1A1A',
  surfaceLight: '#252525',
  border: '#333333',
  text: '#FFFFFF',
  textSecondary: '#999999',
  textMuted: '#666666',

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

  checkmark: '#FFFFFF',
};

export type ColorPalette = typeof LightColors;

export function useColors(): ColorPalette {
  const colorScheme = useStore((s) => s.settings.colorScheme);
  const systemScheme = useColorScheme();
  const resolved = colorScheme === 'auto' ? (systemScheme ?? 'light') : colorScheme;
  return resolved === 'dark' ? DarkColors : LightColors;
}

// Static fallback for non-component code (e.g., _layout.tsx initial render)
export const Colors = LightColors;
