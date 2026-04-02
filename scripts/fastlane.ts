#!/usr/bin/env bun
/**
 * Unified fastlane deployment script for Google Play and Apple App Store.
 *
 * Usage:
 *   bun scripts/fastlane.ts                        # all platforms, all content
 *   bun scripts/fastlane.ts android                # android only, all content
 *   bun scripts/fastlane.ts ios                    # ios only, all content
 *   bun scripts/fastlane.ts android metadata       # android metadata only
 *   bun scripts/fastlane.ts ios screenshots        # ios screenshots only
 *   bun scripts/fastlane.ts all metadata           # both platforms, metadata only
 */

import sharp from 'sharp';
import { cpSync, mkdirSync, rmSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { execSync } from 'child_process';

const PROJECT_ROOT = resolve(import.meta.dir, '..');
const DIST_DIR = join(PROJECT_ROOT, 'dist');
const SCREENSHOTS_SRC = join(PROJECT_ROOT, 'fastlane', 'screenshots');
const DOCKER_IMAGE = 'ruby:3.2';

// ---------------------------------------------------------------------------
// Locale mapping: screenshot dir name -> android metadata locale
// ---------------------------------------------------------------------------
const ANDROID_LOCALE_MAP: Record<string, string> = {
  'en-US': 'en-US',
  'ar-SA': 'ar',
  'bn-BD': 'bn-BD',
  'de-DE': 'de-DE',
  'es-ES': 'es-ES',
  'fr-FR': 'fr-FR',
  'hi': 'hi-IN',
  'id': 'id',
  'it': 'it-IT',
  'ja': 'ja-JP',
  'ko': 'ko-KR',
  'nl-NL': 'nl-NL',
  'pl': 'pl-PL',
  'pt-BR': 'pt-BR',
  'ru': 'ru-RU',
  'th': 'th',
  'tr': 'tr-TR',
  'vi': 'vi',
  'zh-Hans': 'zh-CN',
  'zh-Hant': 'zh-TW',
};

// Apple rejects bn-BD as a locale
const APPLE_INVALID_LOCALES = ['bn-BD'];

// Files in screenshots dir that are not locale dirs
const SKIP_ENTRIES = ['captions.json', 'mockup.html', 'SCREENSHOT_PLAN.md'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function log(msg: string) {
  console.log(`[fastlane] ${msg}`);
}

function run(cmd: string) {
  log(`> ${cmd.substring(0, 120)}${cmd.length > 120 ? '...' : ''}`);
  try {
    execSync(cmd, { stdio: 'inherit', cwd: PROJECT_ROOT, maxBuffer: 50 * 1024 * 1024 });
  } catch (err: any) {
    if (err.stdout) console.log(err.stdout.toString());
    if (err.stderr) console.error(err.stderr.toString());
    throw err;
  }
}

function cleanDir(dir: string) {
  if (existsSync(dir)) rmSync(dir, { recursive: true });
  mkdirSync(dir, { recursive: true });
}

function getLocaleDirs(): string[] {
  return readdirSync(SCREENSHOTS_SRC, { withFileTypes: true })
    .filter(d => d.isDirectory() && !SKIP_ENTRIES.includes(d.name))
    .map(d => d.name);
}

// ---------------------------------------------------------------------------
// Android: prepare dist/fastlane_android
// ---------------------------------------------------------------------------

async function prepareAndroid(content: 'all' | 'metadata' | 'screenshots') {
  const distDir = join(DIST_DIR, 'fastlane_android');
  cleanDir(distDir);

  // Copy metadata
  const metaSrc = join(PROJECT_ROOT, 'fastlane', 'metadata', 'android');
  const metaDest = join(distDir, 'metadata', 'android');
  cpSync(metaSrc, metaDest, { recursive: true });

  if (content === 'metadata') return distDir;

  // Copy screenshots into metadata structure (locale mapping)
  log('Preparing Android screenshots...');
  const locales = getLocaleDirs();

  for (const screenshotLocale of locales) {
    const androidLocale = ANDROID_LOCALE_MAP[screenshotLocale];
    if (!androidLocale) {
      log(`  SKIP: ${screenshotLocale} (no Android mapping)`);
      continue;
    }

    const src = join(SCREENSHOTS_SRC, screenshotLocale);
    const dest = join(metaDest, androidLocale, 'images');

    mkdirSync(join(dest, 'phoneScreenshots'), { recursive: true });
    mkdirSync(join(dest, 'sevenInchScreenshots'), { recursive: true });
    mkdirSync(join(dest, 'tenInchScreenshots'), { recursive: true });

    // Phone screenshots (1-6)
    for (let i = 1; i <= 6; i++) {
      const files = readdirSync(src).filter(f => f.startsWith(`${i}_`) && f.endsWith('.png'));
      for (const f of files) {
        cpSync(join(src, f), join(dest, 'phoneScreenshots', f));
      }
    }

    // Tablet screenshots
    const t7 = join(src, 'tablet7_1.png');
    if (existsSync(t7)) cpSync(t7, join(dest, 'sevenInchScreenshots', 'tablet7_1.png'));

    const t10 = join(src, 'tablet10_1.png');
    if (existsSync(t10)) cpSync(t10, join(dest, 'tenInchScreenshots', 'tablet10_1.png'));

    log(`  ✓ ${androidLocale} (${screenshotLocale})`);
  }

  return distDir;
}

// ---------------------------------------------------------------------------
// iOS: prepare dist/fastlane_ios
// ---------------------------------------------------------------------------

async function prepareIOS(content: 'all' | 'metadata' | 'screenshots') {
  const distDir = join(DIST_DIR, 'fastlane_ios');
  cleanDir(distDir);

  // Create a fastlane dir with Deliverfile so deliver doesn't ask to set up
  mkdirSync(join(distDir, 'fastlane'), { recursive: true });
  writeFileSync(join(distDir, 'fastlane', 'Deliverfile'), '# managed by scripts/fastlane.ts\n');

  // Copy metadata
  if (content !== 'screenshots') {
    const metaSrc = join(PROJECT_ROOT, 'fastlane', 'metadata', 'ios');
    const metaDest = join(distDir, 'metadata', 'ios');
    cpSync(metaSrc, metaDest, { recursive: true });

    // Remove invalid Apple locales
    for (const locale of APPLE_INVALID_LOCALES) {
      const dir = join(metaDest, locale);
      if (existsSync(dir)) rmSync(dir, { recursive: true });
    }

    // Strip emojis from descriptions
    log('Stripping emojis from iOS descriptions...');
    const iosLocales = readdirSync(metaDest, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    for (const locale of iosLocales) {
      const descFile = join(metaDest, locale, 'description.txt');
      if (existsSync(descFile)) {
        let text = readFileSync(descFile, 'utf-8');
        text = text
          .replace(/🫁 /g, '')
          .replace(/☀️ /g, '')
          .replace(/🥗 /g, '')
          .replace(/😴 /g, '')
          .replace(/🏃 /g, '')
          .replace(/🙏 /g, '')
          .replace(/→/g, '-');
        writeFileSync(descFile, text);
      }
    }
  }

  // Copy and process screenshots
  if (content !== 'metadata') {
    const screenshotsDest = join(distDir, 'screenshots');
    cpSync(SCREENSHOTS_SRC, screenshotsDest, { recursive: true });

    // Remove non-locale entries
    for (const entry of SKIP_ENTRIES) {
      const p = join(screenshotsDest, entry);
      if (existsSync(p)) rmSync(p, { recursive: true });
    }

    // Remove invalid Apple locales
    for (const locale of APPLE_INVALID_LOCALES) {
      const dir = join(screenshotsDest, locale);
      if (existsSync(dir)) rmSync(dir, { recursive: true });
    }

    // Process each locale: remove Android tablets, generate iPad screenshots
    log('Processing iOS screenshots...');
    const localeDirs = readdirSync(screenshotsDest, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    for (const locale of localeDirs) {
      const localeDir = join(screenshotsDest, locale);
      const tablet10 = join(localeDir, 'tablet10_1.png');
      const tablet7 = join(localeDir, 'tablet7_1.png');
      const ipadOut = join(localeDir, 'resized_ipad_13_cropped.png');

      // Generate iPad 13" (2064x2752) from tablet10_1 (1440x2560): crop bottom then resize
      if (existsSync(tablet10) && !existsSync(ipadOut)) {
        try {
          await sharp(tablet10)
            .extract({ left: 0, top: 0, width: 1440, height: 1920 })
            .resize(2064, 2752, { fit: 'fill' })
            .png({ compressionLevel: 9 })
            .toFile(ipadOut);
        } catch (err) {
          log(`  ✗ iPad generation failed for ${locale}: ${(err as Error).message}`);
        }
      }

      // Remove Android-only tablet files (invalid Apple sizes)
      if (existsSync(tablet10)) rmSync(tablet10);
      if (existsSync(tablet7)) rmSync(tablet7);

      // Remove resized files from en-US that aren't needed for other locales
      const resizedFiles = readdirSync(localeDir).filter(f => f.startsWith('resized_') && f !== 'resized_ipad_13_cropped.png');
      for (const f of resizedFiles) rmSync(join(localeDir, f));

      log(`  ✓ ${locale}`);
    }
  }

  return distDir;
}

// ---------------------------------------------------------------------------
// Docker: run fastlane commands
// ---------------------------------------------------------------------------

function runAndroid(distDir: string, content: 'all' | 'metadata' | 'screenshots') {
  const metaPath = `/dist/metadata/android`;
  const skipScreenshots = content === 'metadata';

  const flags = [
    '--track production',
    '--skip_upload_apk',
    '--skip_upload_aab',
    '--skip_upload_changelogs',
    `--metadata_path ${metaPath}`,
  ];

  if (skipScreenshots) {
    flags.push('--skip_upload_images');
  }

  run(`docker run --rm ` +
    `-v "${PROJECT_ROOT}/.keys":/app/.keys ` +
    `-v "${distDir}":/dist ` +
    `-v "${PROJECT_ROOT}/fastlane/Appfile":/app/fastlane/Appfile ` +
    `-w /app ` +
    `${DOCKER_IMAGE} ` +
    `bash -c "gem install fastlane --no-document 2>&1 | tail -1 && fastlane supply ${flags.join(' ')}"`
  );
}

function runIOS(distDir: string, content: 'all' | 'metadata' | 'screenshots') {
  const apiKeyPath = `/dist/.keys/apple_api_key.json`;
  const commonFlags = [
    `--api_key_path ${apiKeyPath}`,
    '--app_identifier com.devanco.illll.app',
    '--skip_binary_upload',
    '--force',
    '--run_precheck_before_submit=false',
    '--submit_for_review=false',
    '--skip_app_version_update',
    '--ignore_language_directory_validation',
  ];

  const volumes = [
    `-v "${PROJECT_ROOT}/.keys":/dist/.keys`,
    `-v "${distDir}":/dist`,
    `-w /dist`,
  ];

  const commands: string[] = [];

  if (content !== 'screenshots') {
    const metaFlags = [
      ...commonFlags,
      '--skip_screenshots',
      `--metadata_path /dist/metadata/ios`,
    ].join(' ');
    commands.push(`echo '=== Uploading iOS metadata ===' && fastlane deliver ${metaFlags}`);
  }

  if (content !== 'metadata') {
    const screenshotFlags = [
      ...commonFlags,
      '--skip_metadata',
      '--overwrite_screenshots',
      `--screenshots_path /dist/screenshots`,
    ].join(' ');
    commands.push(`echo '=== Uploading iOS screenshots ===' && fastlane deliver ${screenshotFlags}`);
  }

  run(`docker run --rm ` +
    `-e FASTLANE_NON_INTERACTIVE=1 ` +
    `${volumes.join(' ')} ` +
    `${DOCKER_IMAGE} ` +
    `bash -c "gem install fastlane --no-document 2>&1 | tail -1 && ${commands.join(' && ')}"`
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const platform = (args[0] || 'all') as 'ios' | 'android' | 'all';
  const content = (args[1] || 'all') as 'metadata' | 'screenshots' | 'all';

  if (!['ios', 'android', 'all'].includes(platform)) {
    console.error(`Invalid platform: ${platform}. Use: ios, android, all`);
    process.exit(1);
  }
  if (!['metadata', 'screenshots', 'all'].includes(content)) {
    console.error(`Invalid content: ${content}. Use: metadata, screenshots, all`);
    process.exit(1);
  }

  log(`Platform: ${platform}, Content: ${content}`);

  if (platform === 'android' || platform === 'all') {
    log('--- Android ---');
    const distDir = await prepareAndroid(content);
    runAndroid(distDir, content);
    log('Android done!');
  }

  if (platform === 'ios' || platform === 'all') {
    log('--- iOS ---');
    const distDir = await prepareIOS(content);
    runIOS(distDir, content);
    log('iOS done!');
  }

  log('All done!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
