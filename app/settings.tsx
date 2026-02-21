import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Colors } from '../constants/colors';
import { HABITS } from '../constants/habits';
import { useStore, type HabitId } from '../store/useStore';
import { SUPPORTED_LOCALES, loadLanguage } from '../lib/i18n';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const settings = useStore((s) => s.settings);
  const toggleHideHabit = useStore((s) => s.toggleHideHabit);
  const setLanguage = useStore((s) => s.setLanguage);

  const [showLangPicker, setShowLangPicker] = useState(false);

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleLanguageChange = async (code: string | null) => {
    setLanguage(code);
    const lang = code ?? 'en';
    await loadLanguage(lang);
    setShowLangPicker(false);
  };

  const handleReset = () => {
    Alert.alert(t('settings.resetData'), t('settings.resetConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.yes'),
        style: 'destructive',
        onPress: () => {
          // Clear storage and reload
          const { storage } = require('../store/mmkv');
          storage.clearAll();
          // Force reload by navigating
          router.replace('/');
        },
      },
    ]);
  };

  const currentLang =
    settings.language ??
    SUPPORTED_LOCALES.find((l) => l.code === i18n.language)?.code ??
    'en';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('settings.title')}</Text>
          <Pressable onPress={handleClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>

        {/* Habits Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.habits')}</Text>
          {HABITS.map((habit) => {
            const isHidden = settings.hiddenHabits.includes(habit.id);
            return (
              <View key={habit.id} style={styles.habitRow}>
                <Text style={styles.habitIcon}>{habit.icon}</Text>
                <Text style={styles.habitName}>
                  {t(`habits.${habit.id}.name`)}
                </Text>
                <Switch
                  value={!isHidden}
                  onValueChange={() => toggleHideHabit(habit.id)}
                  trackColor={{
                    false: Colors.border,
                    true: habit.color + '80',
                  }}
                  thumbColor={isHidden ? Colors.textMuted : habit.color}
                />
              </View>
            );
          })}
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.language')}</Text>

          {!showLangPicker ? (
            <Pressable
              style={styles.langButton}
              onPress={() => setShowLangPicker(true)}
            >
              <Text style={styles.langCurrent}>
                {settings.language === null
                  ? t('settings.autoDetect')
                  : SUPPORTED_LOCALES.find((l) => l.code === currentLang)
                      ?.nativeName ?? currentLang}
              </Text>
              <Text style={styles.langArrow}>›</Text>
            </Pressable>
          ) : (
            <View style={styles.langList}>
              {/* Auto-detect option */}
              <Pressable
                style={[
                  styles.langOption,
                  settings.language === null && styles.langOptionActive,
                ]}
                onPress={() => handleLanguageChange(null)}
              >
                <Text
                  style={[
                    styles.langOptionText,
                    settings.language === null && styles.langOptionTextActive,
                  ]}
                >
                  {t('settings.autoDetect')}
                </Text>
              </Pressable>

              {SUPPORTED_LOCALES.map((locale) => (
                <Pressable
                  key={locale.code}
                  style={[
                    styles.langOption,
                    currentLang === locale.code && styles.langOptionActive,
                  ]}
                  onPress={() => handleLanguageChange(locale.code)}
                >
                  <Text
                    style={[
                      styles.langOptionText,
                      currentLang === locale.code &&
                        styles.langOptionTextActive,
                    ]}
                  >
                    {locale.nativeName}
                  </Text>
                  <Text style={styles.langOptionSub}>
                    {locale.englishName}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
          <Text style={styles.versionText}>
            {t('settings.version', { version: '1.0.0' })}
          </Text>
        </View>

        {/* Reset */}
        <Pressable style={styles.resetBtn} onPress={handleReset}>
          <Text style={styles.resetText}>{t('settings.resetData')}</Text>
        </Pressable>

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
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 18,
    color: Colors.text,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  habitIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  habitName: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  langCurrent: {
    fontSize: 16,
    color: Colors.text,
  },
  langArrow: {
    fontSize: 22,
    color: Colors.textMuted,
  },
  langList: {
    gap: 4,
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 14,
  },
  langOptionActive: {
    backgroundColor: Colors.accent + '20',
    borderColor: Colors.accent,
    borderWidth: 1,
  },
  langOptionText: {
    fontSize: 15,
    color: Colors.text,
  },
  langOptionTextActive: {
    color: Colors.accent,
    fontWeight: '600',
  },
  langOptionSub: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  versionText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  resetBtn: {
    backgroundColor: Colors.danger + '15',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.danger + '30',
  },
  resetText: {
    fontSize: 15,
    color: Colors.danger,
    fontWeight: '600',
  },
});
