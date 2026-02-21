// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Zustand v5 ESM files use `import.meta.env` which breaks in Metro's classic
// script output for web. Force Metro to resolve zustand through the CJS
// "react-native" export condition on web as well, avoiding the ESM path.
config.resolver.unstable_conditionsByPlatform = {
  ...config.resolver.unstable_conditionsByPlatform,
  web: ['react-native', 'browser'],
};

module.exports = config;
