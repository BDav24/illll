import { View, Text, ScrollView, StyleSheet, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Colors } from '../../constants/colors';
import { HABIT_MAP } from '../../constants/habits';
import { ARTICLES } from '../../constants/articles';
import type { HabitId } from '../../store/useStore';

export default function HabitArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();

  const habitId = id as HabitId;
  const meta = HABIT_MAP[habitId];
  const article = ARTICLES[habitId];

  if (!meta || !article) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Habit not found</Text>
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
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>✕</Text>
          </Pressable>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroIcon}>{meta.icon}</Text>
          <Text style={styles.heroTitle}>
            {t('article.whyTitle', { habit: t(`habits.${habitId}.name`) })}
          </Text>
        </View>

        {/* TL;DR */}
        <View style={[styles.card, { borderLeftColor: meta.color }]}>
          <Text style={styles.cardLabel}>{t('article.tldr')}</Text>
          <Text style={styles.tldrText}>{article.tldr}</Text>
        </View>

        {/* Body */}
        <View style={styles.bodySection}>
          <Text style={styles.bodyText}>{article.body}</Text>
        </View>

        {/* Studies */}
        <View style={styles.studiesSection}>
          <Text style={styles.sectionTitle}>{t('article.studies')}</Text>
          {article.studies.map((study, i) => (
            <Pressable
              key={i}
              style={styles.studyCard}
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

        {/* Recommendation */}
        <View style={[styles.card, styles.recoCard]}>
          <Text style={styles.cardLabel}>{t('article.recommendation')}</Text>
          <Text style={styles.recoText}>{article.recommendation}</Text>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
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
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 18,
    color: Colors.text,
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
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  tldrText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  bodySection: {
    marginBottom: 24,
  },
  bodyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  studiesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  studyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  studyAuthors: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  studyTitle: {
    fontSize: 14,
    color: Colors.text,
    fontStyle: 'italic',
    marginBottom: 4,
    lineHeight: 20,
  },
  studyJournal: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  studyDoi: {
    fontSize: 12,
    color: Colors.accent,
  },
  recoCard: {
    borderLeftColor: Colors.success,
  },
  recoText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 24,
  },
  errorText: {
    color: Colors.text,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
});
