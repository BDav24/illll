import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';

interface StreakBadgeProps {
  count: number;
}

export function StreakBadge({ count }: StreakBadgeProps) {
  const { t } = useTranslation();

  if (count === 0) {
    return (
      <View style={styles.container}>
        <Text style={[styles.emoji, styles.dimmed]}>🔥</Text>
        <Text style={[styles.text, styles.dimmed]}>
          {t('hub.streakZero')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🔥</Text>
      <Text style={styles.count}>{count}</Text>
      <Text style={styles.text}>{t('hub.streak', { count })}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emoji: {
    fontSize: 18,
  },
  count: {
    color: Colors.text,
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
  text: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: Fonts.regular,
  },
  dimmed: {
    opacity: 0.4,
  },
});
