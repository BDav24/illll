import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useColors, type ColorPalette } from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { HABITS } from '../constants/habits';
import { useStore, type HabitId, type ColorScheme } from '../store/useStore';
import { SUPPORTED_LOCALES, loadLanguage, getDeviceLocale } from '../lib/i18n';

function confirmAlert(
  title: string,
  message: string,
  onConfirm: () => void,
  buttons?: { cancel: string; confirm: string },
) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n${message}`)) {
      onConfirm();
    }
  } else {
    Alert.alert(title, message, [
      { text: buttons?.cancel ?? 'Cancel', style: 'cancel' },
      { text: buttons?.confirm ?? 'OK', style: 'destructive', onPress: onConfirm },
    ]);
  }
}

const COLOR_SCHEME_OPTIONS: { value: ColorScheme; labelKey: string }[] = [
  { value: 'light', labelKey: 'settings.themeLight' },
  { value: 'dark', labelKey: 'settings.themeDark' },
  { value: 'auto', labelKey: 'settings.themeAuto' },
];

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const hiddenHabits = useStore((s) => s.settings.hiddenHabits);
  const customHabits = useStore((s) => s.settings.customHabits);
  const language = useStore((s) => s.settings.language);
  const currentScheme = useStore((s) => s.settings.colorScheme);
  const toggleHideHabit = useStore((s) => s.toggleHideHabit);
  const setLanguage = useStore((s) => s.setLanguage);
  const setColorScheme = useStore((s) => s.setColorScheme);
  const addCustomHabit = useStore((s) => s.addCustomHabit);
  const deleteCustomHabit = useStore((s) => s.deleteCustomHabit);
  const resetAll = useStore((s) => s.resetAll);

  const [showLangPicker, setShowLangPicker] = useState(false);
  const [newHabitText, setNewHabitText] = useState('');

  const handleClose = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [router]);

  const handleAddHabit = useCallback(() => {
    const trimmed = newHabitText.trim();
    if (trimmed.length === 0) return;
    addCustomHabit(trimmed);
    setNewHabitText('');
  }, [newHabitText, addCustomHabit]);

  const handleLanguageChange = async (code: string | null) => {
    setLanguage(code);
    const lang = code ?? getDeviceLocale();
    await loadLanguage(lang);
    setShowLangPicker(false);
  };

  const handleReset = () => {
    confirmAlert(
      t('settings.resetData'),
      t('settings.resetConfirm'),
      () => {
        resetAll();
        router.replace('/');
      },
      { cancel: t('common.cancel'), confirm: t('common.yes') },
    );
  };

  const currentLang =
    language ??
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
          <Text style={styles.title} accessibilityRole="header">{t('settings.title')}</Text>
          <Pressable onPress={handleClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel={t('accessibility.close')} hitSlop={4}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>

        {/* Habits Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle} accessibilityRole="header">{t('settings.habits')}</Text>
          {HABITS.map((habit) => {
            const isHidden = hiddenHabits.includes(habit.id);
            return (
              <View key={habit.id} style={styles.habitRow}>
                <Text style={styles.habitIcon} importantForAccessibility="no">{habit.icon}</Text>
                <Text style={styles.habitName}>
                  {t(`habits.${habit.id}.name`)}
                </Text>
                <Switch
                  value={!isHidden}
                  onValueChange={() => toggleHideHabit(habit.id)}
                  trackColor={{
                    false: colors.border,
                    true: colors[habit.id] + '80',
                  }}
                  thumbColor={isHidden ? colors.textMuted : colors[habit.id]}
                  accessibilityLabel={t(`habits.${habit.id}.name`)}
                />
              </View>
            );
          })}
        </View>

        {/* Custom Habits Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle} accessibilityRole="header">{t('settings.myHabits')}</Text>
          {customHabits.map((ch) => (
            <View key={ch.id} style={styles.customHabitRow}>
              <Text style={styles.habitName}>{ch.text}</Text>
              <Pressable onPress={() => {
                confirmAlert(
                  t('common.delete'),
                  ch.text,
                  () => deleteCustomHabit(ch.id),
                  { cancel: t('common.cancel'), confirm: t('common.delete') },
                );
              }} hitSlop={8} accessibilityRole="button" accessibilityLabel={t('accessibility.deleteHabit', { name: ch.text })}>
                <Text style={styles.deleteIcon}>✕</Text>
              </Pressable>
            </View>
          ))}
          <View style={styles.addHabitRow}>
            <TextInput
              style={styles.addHabitInput}
              placeholder={t('settings.addHabit')}
              placeholderTextColor={colors.textMuted}
              value={newHabitText}
              onChangeText={setNewHabitText}
              onSubmitEditing={handleAddHabit}
              returnKeyType="done"
              accessibilityLabel={t('settings.addHabit')}
            />
            <Pressable onPress={handleAddHabit} style={styles.addHabitBtn} accessibilityRole="button" accessibilityLabel={t('accessibility.addHabit')} hitSlop={4}>
              <Text style={styles.addHabitBtnText}>+</Text>
            </Pressable>
          </View>
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle} accessibilityRole="header">{t('settings.language')}</Text>

          {!showLangPicker ? (
            <Pressable
              style={styles.langButton}
              onPress={() => setShowLangPicker(true)}
              accessibilityRole="button"
            >
              <Text style={styles.langCurrent}>
                {language === null
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
                  language === null && styles.langOptionActive,
                ]}
                onPress={() => handleLanguageChange(null)}
                accessibilityRole="radio"
                accessibilityState={{ selected: language === null }}
              >
                <Text
                  style={[
                    styles.langOptionText,
                    language === null && styles.langOptionTextActive,
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
                  accessibilityRole="radio"
                  accessibilityState={{ selected: currentLang === locale.code }}
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

        {/* Color Scheme Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle} accessibilityRole="header">{t('settings.theme')}</Text>
          <View style={styles.langList}>
            {COLOR_SCHEME_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.langOption,
                  currentScheme === option.value && styles.langOptionActive,
                ]}
                onPress={() => setColorScheme(option.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: currentScheme === option.value }}
              >
                <Text
                  style={[
                    styles.langOptionText,
                    currentScheme === option.value && styles.langOptionTextActive,
                  ]}
                >
                  {t(option.labelKey)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle} accessibilityRole="header">{t('settings.about')}</Text>
          <Text style={styles.versionText}>
            {t('settings.version', { version: '1.0.0' })}
          </Text>
        </View>

        {/* Reset */}
        <Pressable style={styles.resetBtn} onPress={handleReset} accessibilityRole="button">
          <Text style={styles.resetText}>{t('settings.resetData')}</Text>
        </Pressable>

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
      fontFamily: Fonts.bold,
      color: colors.text,
    },
    closeBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeText: {
      fontSize: 18,
      fontFamily: Fonts.regular,
      color: colors.text,
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: Fonts.semiBold,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 12,
    },
    habitRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
    },
    customHabitRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 14,
      marginBottom: 6,
    },
    habitIcon: {
      fontSize: 20,
      marginRight: 12,
    },
    habitName: {
      flex: 1,
      fontSize: 16,
      fontFamily: Fonts.regular,
      color: colors.text,
    },
    langButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
    },
    langCurrent: {
      fontSize: 16,
      fontFamily: Fonts.regular,
      color: colors.text,
    },
    langArrow: {
      fontSize: 22,
      fontFamily: Fonts.regular,
      color: colors.textMuted,
    },
    langList: {
      gap: 4,
    },
    langOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderRadius: 10,
      padding: 14,
    },
    langOptionActive: {
      backgroundColor: colors.accent + '20',
      borderColor: colors.accent,
      borderWidth: 1,
    },
    langOptionText: {
      fontSize: 15,
      fontFamily: Fonts.regular,
      color: colors.text,
    },
    langOptionTextActive: {
      color: colors.accent,
      fontFamily: Fonts.semiBold,
    },
    langOptionSub: {
      fontSize: 12,
      fontFamily: Fonts.regular,
      color: colors.textMuted,
    },
    versionText: {
      fontSize: 14,
      fontFamily: Fonts.regular,
      color: colors.textMuted,
    },
    resetBtn: {
      backgroundColor: colors.danger + '15',
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.danger + '30',
    },
    resetText: {
      fontSize: 15,
      color: colors.danger,
      fontFamily: Fonts.semiBold,
    },
    deleteIcon: {
      color: colors.textMuted,
      fontSize: 16,
      fontFamily: Fonts.regular,
      padding: 8,
    },
    addHabitRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 4,
      gap: 8,
    },
    addHabitInput: {
      flex: 1,
      color: colors.text,
      fontSize: 15,
      fontFamily: Fonts.regular,
      paddingVertical: 10,
    },
    addHabitBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surfaceLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addHabitBtnText: {
      color: colors.textSecondary,
      fontSize: 20,
      fontFamily: Fonts.semiBold,
      lineHeight: 22,
    },
    bottomSpacer: {
      height: 60,
    },
  });
}
