import { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useColors, type ColorPalette } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { HABIT_MAP } from '../../constants/habits';
import { ARTICLES } from '../../constants/articles';
import type { HabitId } from '../../store/useStore';

export default function HabitArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const habitId = id as HabitId;
  const meta = HABIT_MAP[habitId];
  const article = ARTICLES[habitId];

  if (!meta || !article) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{t('common.notFound')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel={t('accessibility.close')} hitSlop={4}>
            <Text style={styles.backText}>✕</Text>
          </Pressable>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroIcon} importantForAccessibility="no">{meta.icon}</Text>
          <Text style={styles.heroTitle} accessibilityRole="header">
            {t('article.whyTitle', { habit: t(`habits.${habitId}.name`) })}
          </Text>
        </View>

        {/* TL;DR */}
        <View style={[styles.card, { borderLeftColor: meta.color }]}>
          <Text style={styles.cardLabel} accessibilityRole="header">{t('article.tldr')}</Text>
          <Text style={styles.tldrText}>{t(`habits.${habitId}.tldr`)}</Text>
        </View>

        {/* Body */}
        <View style={styles.bodySection}>
          <Text style={styles.bodyText}>{t(`habits.${habitId}.body`)}</Text>
        </View>

        {/* Studies */}
        <View style={styles.studiesSection}>
          <Text style={styles.sectionTitle} accessibilityRole="header">{t('article.studies')}</Text>
          {article.studies.map((study, i) => (
            <Pressable
              key={i}
              style={styles.studyCard}
              accessibilityRole="link"
              accessibilityHint={t('accessibility.openStudy')}
              onPress={() =>
                Linking.openURL(`https://doi.org/${study.doi}`)
              }
            >
              <Text style={styles.studyAuthors}>{study.authors}</Text>
              <Text style={styles.studyTitle}>"{study.title}"</Text>
              <Text style={styles.studyJournal}>
                {study.journal}, {study.year}
              </Text>
              <Text style={styles.studyDoi}>DOI: {study.doi} →</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 8,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginBottom: 8,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    backText: {
      fontSize: 18,
      fontFamily: Fonts.regular,
      color: colors.text,
    },
    hero: {
      alignItems: 'center',
      marginBottom: 28,
    },
    heroIcon: {
      fontSize: 56,
      marginBottom: 12,
    },
    heroTitle: {
      fontSize: 26,
      fontFamily: Fonts.bold,
      color: colors.text,
      textAlign: 'center',
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderLeftWidth: 4,
      borderLeftColor: colors.accent,
    },
    cardLabel: {
      fontSize: 12,
      fontFamily: Fonts.bold,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 8,
    },
    tldrText: {
      fontSize: 16,
      fontFamily: Fonts.regular,
      color: colors.text,
      lineHeight: 24,
    },
    bodySection: {
      marginBottom: 24,
    },
    bodyText: {
      fontSize: 15,
      fontFamily: Fonts.regular,
      color: colors.textSecondary,
      lineHeight: 24,
    },
    studiesSection: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: Fonts.semiBold,
      color: colors.text,
      marginBottom: 12,
    },
    studyCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 10,
    },
    studyAuthors: {
      fontSize: 13,
      fontFamily: Fonts.semiBold,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    studyTitle: {
      fontSize: 14,
      fontFamily: Fonts.regular,
      color: colors.text,
      fontStyle: 'italic',
      marginBottom: 4,
      lineHeight: 20,
    },
    studyJournal: {
      fontSize: 12,
      fontFamily: Fonts.regular,
      color: colors.textMuted,
      marginBottom: 4,
    },
    studyDoi: {
      fontSize: 12,
      fontFamily: Fonts.regular,
      color: colors.accent,
    },
    errorText: {
      color: colors.text,
      fontSize: 16,
      fontFamily: Fonts.regular,
      textAlign: 'center',
      marginTop: 100,
    },
    bottomSpacer: {
      height: 60,
    },
  });
}
