import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useColors, type ColorPalette } from '../constants/colors';
import { Fonts } from '../constants/fonts';

interface StreakBadgeProps {
  count: number;
}

export function StreakBadge({ count }: StreakBadgeProps) {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

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

function makeStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    emoji: {
      fontSize: 18,
    },
    count: {
      color: colors.text,
      fontSize: 16,
      fontFamily: Fonts.bold,
    },
    text: {
      color: colors.textSecondary,
      fontSize: 14,
      fontFamily: Fonts.regular,
    },
    dimmed: {
      opacity: 0.4,
    },
  });
}
