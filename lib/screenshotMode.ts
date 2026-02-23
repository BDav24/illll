import { Platform } from 'react-native';

export type ScreenshotScene =
  | 'hub-progress'
  | 'hub-complete'
  | 'streaks'
  | 'article'
  | 'settings'
  | 'breathing';

interface ScreenshotConfig {
  enabled: boolean;
  lang: string;
  scene: ScreenshotScene;
}

function parse(): ScreenshotConfig {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return { enabled: false, lang: 'en', scene: 'hub-progress' };
  }
  const params = new URLSearchParams(window.location.search);
  const enabled = params.get('screenshot') === '1';
  const lang = params.get('lang') || 'en';
  const scene = (params.get('scene') || 'hub-progress') as ScreenshotScene;
  return { enabled, lang, scene };
}

export const screenshotConfig = parse();
