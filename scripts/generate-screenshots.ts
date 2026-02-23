#!/usr/bin/env bun
/**
 * Automated screenshot generation for all locales.
 *
 * Prerequisites: `bun run web` must be running on port 8081.
 *
 * Usage:
 *   bun scripts/generate-screenshots.ts          # all locales
 *   bun scripts/generate-screenshots.ts en        # single locale
 *   bun scripts/generate-screenshots.ts en es ja  # multiple locales
 */

import puppeteer from 'puppeteer';
import sharp from 'sharp';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const PROJECT_ROOT = resolve(import.meta.dir, '..');
const SCREENSHOTS_DIR = join(PROJECT_ROOT, 'fastlane', 'screenshots');
const CAPTIONS_PATH = join(SCREENSHOTS_DIR, 'captions.json');
const MOCKUP_PATH = 'fastlane/screenshots/mockup.html';

const STATIC_PORT = 9000;
const APP_PORT = 8081;

const VIEWPORT = { width: 430, height: 932, deviceScaleFactor: 3 };

// Scene definitions: id, filename, app path (for iframe navigation)
const SCENES = [
  { id: 'hub-progress', file: '1_daily_hub_progress.png', path: '' },
  { id: 'hub-complete', file: '2_daily_hub_complete.png', path: '' },
  { id: 'streaks', file: '3_progress_streaks.png', path: '/progress' },
  { id: 'article', file: '4_habit_article.png', path: '/habit/exercise' },
  { id: 'settings', file: '5_settings_custom.png', path: '/settings' },
  { id: 'breathing', file: '6_breathing_timer.png', path: '' },
] as const;

// Locale code → fastlane directory name
const LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it',
  'pt-BR': 'pt-BR',
  nl: 'nl-NL',
  pl: 'pl',
  tr: 'tr',
  ru: 'ru',
  ja: 'ja',
  ko: 'ko',
  'zh-Hans': 'zh-Hans',
  'zh-Hant': 'zh-Hant',
  ar: 'ar-SA',
  hi: 'hi',
  bn: 'bn-BD',
  th: 'th',
  id: 'id',
  vi: 'vi',
};

const ALL_LOCALES = Object.keys(LOCALE_MAP);

// ---------------------------------------------------------------------------
// Static file server
// ---------------------------------------------------------------------------

function startStaticServer() {
  return Bun.serve({
    port: STATIC_PORT,
    async fetch(req) {
      const url = new URL(req.url);
      let filePath = join(PROJECT_ROOT, url.pathname === '/' ? 'index.html' : url.pathname);

      // Serve directory index
      if (existsSync(filePath) && Bun.file(filePath).size === undefined) {
        filePath = join(filePath, 'index.html');
      }

      const file = Bun.file(filePath);
      if (await file.exists()) {
        return new Response(file);
      }
      return new Response('Not found', { status: 404 });
    },
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // Determine which locales to process
  const args = process.argv.slice(2);
  const locales = args.length > 0
    ? args.filter((a) => LOCALE_MAP[a] || ALL_LOCALES.includes(a))
    : ALL_LOCALES;

  if (locales.length === 0) {
    console.error('No valid locales specified. Available:', ALL_LOCALES.join(', '));
    process.exit(1);
  }

  // Load captions
  const captions = JSON.parse(readFileSync(CAPTIONS_PATH, 'utf-8'));

  // Start static file server
  const server = startStaticServer();
  console.log(`Static server on http://localhost:${STATIC_PORT}`);

  // Check app is running
  try {
    await fetch(`http://localhost:${APP_PORT}`);
  } catch {
    console.error(`App not running on port ${APP_PORT}. Run "bun run web" first.`);
    server.stop();
    process.exit(1);
  }

  // Launch browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const total = locales.length * SCENES.length;
  let done = 0;

  for (const lang of locales) {
    const dir = join(SCREENSHOTS_DIR, LOCALE_MAP[lang]);
    mkdirSync(dir, { recursive: true });

    for (const scene of SCENES) {
      const page = await browser.newPage();

      await page.setViewport(VIEWPORT);
      await page.emulateMediaFeatures([
        { name: 'prefers-color-scheme', value: 'dark' },
      ]);

      // Clear app localStorage so screenshot mode seeds fresh data
      await page.goto(`http://localhost:${APP_PORT}`, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => localStorage.clear());

      // Build mockup URL
      const caption = captions[scene.id]?.[lang] ?? captions[scene.id]?.en ?? '';
      const mockupUrl = new URL(`http://localhost:${STATIC_PORT}/${MOCKUP_PATH}`);
      mockupUrl.searchParams.set('caption', caption);
      mockupUrl.searchParams.set('screenshot', '1');
      mockupUrl.searchParams.set('lang', lang);
      mockupUrl.searchParams.set('scene', scene.id);
      if (scene.path) mockupUrl.searchParams.set('path', scene.path);

      await page.goto(mockupUrl.toString(), { waitUntil: 'networkidle0', timeout: 30000 });

      // Wait for app to render inside iframe
      // The breathing scene needs extra time for the timer to start
      const waitMs = scene.id === 'breathing' ? 4000 : 2500;
      await new Promise((r) => setTimeout(r, waitMs));

      // Capture screenshot
      const outPath = join(dir, scene.file);
      await page.screenshot({ path: outPath, type: 'png' });

      // Optimize with sharp (lossless PNG recompression)
      const buf = await sharp(outPath)
        .png({ compressionLevel: 9 })
        .toBuffer();
      await Bun.write(outPath, buf);

      await page.close();

      done++;
      const pct = Math.round((done / total) * 100);
      console.log(`[${pct}%] ${LOCALE_MAP[lang]}/${scene.file}`);
    }
  }

  await browser.close();
  server.stop();

  console.log(`\nDone! Generated ${done} screenshots.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
