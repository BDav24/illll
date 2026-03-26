import { useState, useCallback, useMemo } from 'react';
import Svg, { Path } from 'react-native-svg';

function PencilIcon({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

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
  KeyboardAvoidingView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useColors, type ColorPalette } from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { HABITS, HABIT_MAP } from '../constants/habits';
import { useStore, type ColorScheme, type HabitId, getGlobalHabitOrder } from '../store/useStore';
import i18n, { SUPPORTED_LOCALES, loadLanguage, getDeviceLocale } from '../lib/i18n';
import { retranslateDefaults } from '../constants/notifications';
import { screenshotConfig } from '../lib/screenshotMode';

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
      { text: buttons?.cancel ?? i18n.t('common.cancel'), style: 'cancel' },
      { text: buttons?.confirm ?? i18n.t('common.ok'), style: 'destructive', onPress: onConfirm },
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
  const editCustomHabit = useStore((s) => s.editCustomHabit);
  const deleteCustomHabit = useStore((s) => s.deleteCustomHabit);
  const habitCriteria = useStore((s) => s.settings.habitCriteria);
  const setHabitCriterion = useStore((s) => s.setHabitCriterion);
  const notifications = useStore((s) => s.settings.notifications) ?? [];
  const setNotifications = useStore((s) => s.setNotifications);
  const quietHoursEnabled = useStore((s) => s.settings.quietHoursEnabled);
  const quietHoursStart = useStore((s) => s.settings.quietHoursStart);
  const quietHoursEnd = useStore((s) => s.settings.quietHoursEnd);
  const settings = useStore((s) => s.settings);
  const setHabitPosition = useStore((s) => s.setHabitPosition);
  const resetAll = useStore((s) => s.resetAll);

  const globalOrder = useMemo(() => getGlobalHabitOrder(settings), [settings]);

  const [showLangPicker, setShowLangPicker] = useState(
    screenshotConfig.enabled && screenshotConfig.scene === 'settings',
  );
  const [habitModalVisible, setHabitModalVisible] = useState(false);
  const [habitModalId, setHabitModalId] = useState<string | null>(null);
  const [habitModalName, setHabitModalName] = useState('');
  const [habitModalGoal, setHabitModalGoal] = useState('');
  const [habitModalIcon, setHabitModalIcon] = useState('');
  const [habitModalPosition, setHabitModalPosition] = useState('');

  const [builtinGoalHabit, setBuiltinGoalHabit] = useState<string | null>(null);
  const [builtinGoalVisible, setBuiltinGoalVisible] = useState(false);
  const [builtinGoalDraft, setBuiltinGoalDraft] = useState('');
  const [builtinGoalPosition, setBuiltinGoalPosition] = useState('');

  const openBuiltinGoalModal = useCallback((habitId: string) => {
    setBuiltinGoalHabit(habitId);
    setBuiltinGoalDraft(habitCriteria[habitId] || t(`habits.${habitId}.criterion`));
    const idx = globalOrder.indexOf(habitId);
    setBuiltinGoalPosition(String(idx + 1));
    setBuiltinGoalVisible(true);
  }, [habitCriteria, t, globalOrder]);

  const closeBuiltinGoalModal = useCallback(() => {
    setBuiltinGoalVisible(false);
  }, []);

  const handleSaveBuiltinGoal = useCallback(() => {
    if (builtinGoalHabit) {
      setHabitCriterion(builtinGoalHabit, builtinGoalDraft.trim());
      const pos = parseInt(builtinGoalPosition, 10);
      if (!isNaN(pos)) {
        setHabitPosition(builtinGoalHabit, pos - 1);
      }
    }
    setBuiltinGoalVisible(false);
  }, [builtinGoalHabit, builtinGoalDraft, builtinGoalPosition, setHabitCriterion, setHabitPosition]);

  const handleClose = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [router]);

  const openHabitModal = useCallback((id?: string) => {
    if (id) {
      const ch = customHabits.find((c) => c.id === id);
      if (!ch) return;
      setHabitModalId(id);
      setHabitModalName(ch.text);
      setHabitModalGoal(habitCriteria[id] || '');
      setHabitModalIcon(ch.icon || '');
      const idx = globalOrder.indexOf(id);
      setHabitModalPosition(String(idx + 1));
    } else {
      setHabitModalId(null);
      setHabitModalName('');
      setHabitModalGoal('');
      setHabitModalIcon('');
      setHabitModalPosition(String(globalOrder.length + 1));
    }
    setHabitModalVisible(true);
  }, [customHabits, habitCriteria, globalOrder]);

  const handleSaveHabit = useCallback(() => {
    const trimmedName = habitModalName.trim();
    if (!trimmedName) return;
    const pos = parseInt(habitModalPosition, 10);
    if (habitModalId) {
      editCustomHabit(habitModalId, trimmedName, habitModalIcon);
      setHabitCriterion(habitModalId, habitModalGoal.trim());
      if (!isNaN(pos)) {
        setHabitPosition(habitModalId, pos - 1);
      }
    } else {
      addCustomHabit(trimmedName, habitModalIcon);
      // Set criterion and position for newly created habit
      const goalTrimmed = habitModalGoal.trim();
      setTimeout(() => {
        const latest = useStore.getState().settings.customHabits;
        const created = latest[latest.length - 1];
        if (created && created.text === trimmedName) {
          if (goalTrimmed) {
            setHabitCriterion(created.id, goalTrimmed);
          }
          if (!isNaN(pos)) {
            setHabitPosition(created.id, pos - 1);
          }
        }
      }, 0);
    }
    setHabitModalVisible(false);
  }, [habitModalId, habitModalName, habitModalGoal, habitModalIcon, habitModalPosition, addCustomHabit, editCustomHabit, setHabitCriterion, setHabitPosition]);

  const handleLanguageChange = async (code: string | null) => {
    setLanguage(code);
    const lang = code ?? getDeviceLocale();
    await loadLanguage(lang);
    setShowLangPicker(false);

    // Re-translate unedited default reminders
    if (notifications.length > 0) {
      const updated = retranslateDefaults(notifications, t);
      setNotifications(updated);
      import('../lib/notifications').then((m) =>
        m.syncNotifications(updated, {
          enabled: quietHoursEnabled,
          start: quietHoursStart,
          end: quietHoursEnd,
        }),
      );
    }
  };

  const handleReset = () => {
    confirmAlert(
      t('settings.resetData'),
      t('settings.resetConfirm'),
      () => {
        import('../lib/notifications').then((m) => m.cancelAll());
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
      <KeyboardAvoidingView
        style={styles.scroll}
        behavior="padding"
      >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
          {globalOrder.map((id) => {
            const builtin = HABIT_MAP[id as HabitId];
            if (builtin) {
              const isHidden = hiddenHabits.includes(id as HabitId);
              return (
                <Pressable
                  key={id}
                  style={[styles.habitRow, isHidden && styles.habitRowHidden]}
                  onPress={() => openBuiltinGoalModal(id)}
                >
                  <Text style={styles.habitIcon} aria-hidden>{builtin.icon}</Text>
                  <View style={styles.habitInfo}>
                    <Text style={[styles.habitName, isHidden && styles.habitNameHidden]}>
                      {t(`habits.${id}.name`)}
                    </Text>
                  </View>
                  <PencilIcon color={colors.textMuted} />
                </Pressable>
              );
            }
            const ch = customHabits.find((c) => c.id === id);
            if (!ch) return null;
            return (
              <Pressable key={ch.id} style={styles.customHabitRow} onPress={() => openHabitModal(ch.id)}>
                {ch.icon ? <Text style={styles.habitIcon} aria-hidden>{ch.icon}</Text> : null}
                <Text style={styles.habitName}>{ch.text}</Text>
                <PencilIcon color={colors.textMuted} />
              </Pressable>
            );
          })}
          <Pressable style={styles.addHabitRow} onPress={() => openHabitModal()} accessibilityRole="button" accessibilityLabel={t('accessibility.addHabit')}>
            <Text style={styles.addHabitPlaceholder}>{t('settings.addHabit')}</Text>
            <View style={styles.addHabitBtn}>
              <Text style={styles.addHabitBtnText}>+</Text>
            </View>
          </Pressable>
        </View>

        {/* Reminders (native only) */}
        {Platform.OS !== 'web' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} accessibilityRole="header">{t('settings.reminders')}</Text>
            <Pressable
              style={styles.langButton}
              onPress={() => router.push('/reminders')}
              accessibilityRole="button"
            >
              <Text style={styles.langCurrent}>{t('settings.manageReminders')}</Text>
              <Text style={styles.langArrow}>{'\u203A'}</Text>
            </Pressable>
          </View>
        )}

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
      </KeyboardAvoidingView>

      {/* Edit Built-in Habit Goal Modal */}
      <Modal
        visible={builtinGoalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeBuiltinGoalModal}
        onDismiss={() => setBuiltinGoalHabit(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={closeBuiltinGoalModal}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <Pressable style={styles.modalContent} onPress={() => {}}>
              {builtinGoalHabit && (
                <>
                  <Text style={styles.modalTitle}>
                    {HABITS.find((h) => h.id === builtinGoalHabit)?.icon}{' '}
                    {t(`habits.${builtinGoalHabit}.name`)}
                  </Text>
                  <Text style={styles.builtinGoalLabel}>{t('settings.myGoal')}</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder={t('criteria.placeholder')}
                    placeholderTextColor={colors.textMuted}
                    value={builtinGoalDraft}
                    onChangeText={setBuiltinGoalDraft}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={handleSaveBuiltinGoal}
                  />
                  <View style={styles.positionRow}>
                    <Text style={styles.visibilityLabel}>{t('settings.position')}</Text>
                    <View style={styles.positionControls}>
                      <Pressable
                        style={[styles.positionBtn, parseInt(builtinGoalPosition, 10) <= 1 && styles.positionBtnDisabled]}
                        onPress={() => setBuiltinGoalPosition(String(Math.max(1, parseInt(builtinGoalPosition, 10) - 1)))}
                        disabled={parseInt(builtinGoalPosition, 10) <= 1}
                        hitSlop={4}
                      >
                        <Text style={[styles.positionBtnText, parseInt(builtinGoalPosition, 10) <= 1 && styles.positionBtnTextDisabled]}>−</Text>
                      </Pressable>
                      <TextInput
                        style={styles.positionInput}
                        value={builtinGoalPosition}
                        onChangeText={setBuiltinGoalPosition}
                        keyboardType="number-pad"
                        maxLength={2}
                      />
                      <Pressable
                        style={[styles.positionBtn, parseInt(builtinGoalPosition, 10) >= globalOrder.length && styles.positionBtnDisabled]}
                        onPress={() => setBuiltinGoalPosition(String(Math.min(globalOrder.length, parseInt(builtinGoalPosition, 10) + 1)))}
                        disabled={parseInt(builtinGoalPosition, 10) >= globalOrder.length}
                        hitSlop={4}
                      >
                        <Text style={[styles.positionBtnText, parseInt(builtinGoalPosition, 10) >= globalOrder.length && styles.positionBtnTextDisabled]}>+</Text>
                      </Pressable>
                      <Text style={styles.positionTotal}>/ {globalOrder.length}</Text>
                    </View>
                  </View>
                  <View style={styles.visibilityRow}>
                    <Text style={styles.visibilityLabel}>{t('settings.showOnDailyHub')}</Text>
                    <Switch
                      value={!hiddenHabits.includes(builtinGoalHabit as HabitId)}
                      onValueChange={() => toggleHideHabit(builtinGoalHabit as HabitId)}
                      trackColor={{
                        false: colors.border,
                        true: (colors as any)[builtinGoalHabit] + '80',
                      }}
                      thumbColor={
                        hiddenHabits.includes(builtinGoalHabit as HabitId)
                          ? colors.textMuted
                          : (colors as any)[builtinGoalHabit]
                      }
                    />
                  </View>
                  <View style={styles.modalButtons}>
                    <Pressable
                      style={styles.modalCancelBtn}
                      onPress={closeBuiltinGoalModal}
                    >
                      <Text style={styles.modalCancelText}>{t('common.cancel')}</Text>
                    </Pressable>
                    <Pressable
                      style={styles.modalSaveBtn}
                      onPress={handleSaveBuiltinGoal}
                    >
                      <Text style={styles.modalSaveText}>{t('settings.save')}</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>

      {/* Add / Edit Custom Habit Modal */}
      <Modal
        visible={habitModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setHabitModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setHabitModalVisible(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <Pressable style={styles.modalContent} onPress={() => {}}>
              <Text style={styles.modalTitle}>
                {habitModalId ? t('settings.editHabit') : t('settings.addHabitTitle')}
              </Text>
              <View style={styles.emojiNameRow}>
                <TextInput
                  style={styles.emojiInput}
                  placeholder="😊"
                  placeholderTextColor={colors.textMuted}
                  value={habitModalIcon}
                  onChangeText={(text) => setHabitModalIcon(text.slice(0, 2))}
                  textAlign="center"
                />
                <TextInput
                  style={[styles.modalInput, styles.nameInput]}
                  placeholder={t('settings.habitName')}
                  placeholderTextColor={colors.textMuted}
                  value={habitModalName}
                  onChangeText={setHabitModalName}
                  autoFocus
                  returnKeyType="next"
                />
              </View>
              <TextInput
                style={styles.modalInput}
                placeholder={t('settings.goalOptional')}
                placeholderTextColor={colors.textMuted}
                value={habitModalGoal}
                onChangeText={setHabitModalGoal}
                returnKeyType="done"
                onSubmitEditing={handleSaveHabit}
              />
              <View style={styles.positionRow}>
                <Text style={styles.visibilityLabel}>{t('settings.position')}</Text>
                <View style={styles.positionControls}>
                  <Pressable
                    style={[styles.positionBtn, parseInt(habitModalPosition, 10) <= 1 && styles.positionBtnDisabled]}
                    onPress={() => setHabitModalPosition(String(Math.max(1, parseInt(habitModalPosition, 10) - 1)))}
                    disabled={parseInt(habitModalPosition, 10) <= 1}
                    hitSlop={4}
                  >
                    <Text style={[styles.positionBtnText, parseInt(habitModalPosition, 10) <= 1 && styles.positionBtnTextDisabled]}>−</Text>
                  </Pressable>
                  <TextInput
                    style={styles.positionInput}
                    value={habitModalPosition}
                    onChangeText={setHabitModalPosition}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                  <Pressable
                    style={[styles.positionBtn, parseInt(habitModalPosition, 10) >= (habitModalId ? globalOrder.length : globalOrder.length + 1) && styles.positionBtnDisabled]}
                    onPress={() => setHabitModalPosition(String(Math.min(habitModalId ? globalOrder.length : globalOrder.length + 1, parseInt(habitModalPosition, 10) + 1)))}
                    disabled={parseInt(habitModalPosition, 10) >= (habitModalId ? globalOrder.length : globalOrder.length + 1)}
                    hitSlop={4}
                  >
                    <Text style={[styles.positionBtnText, parseInt(habitModalPosition, 10) >= (habitModalId ? globalOrder.length : globalOrder.length + 1) && styles.positionBtnTextDisabled]}>+</Text>
                  </Pressable>
                  <Text style={styles.positionTotal}>/ {habitModalId ? globalOrder.length : globalOrder.length + 1}</Text>
                </View>
              </View>
              <View style={styles.modalButtons}>
                <Pressable
                  style={styles.modalCancelBtn}
                  onPress={() => setHabitModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>{t('common.cancel')}</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalSaveBtn, !habitModalName.trim() && styles.modalSaveBtnDisabled]}
                  onPress={handleSaveHabit}
                  disabled={!habitModalName.trim()}
                >
                  <Text style={[styles.modalSaveText, !habitModalName.trim() && styles.modalSaveTextDisabled]}>
                    {t('settings.save')}
                  </Text>
                </Pressable>
              </View>
              {habitModalId && (
                <Pressable
                  style={styles.modalDeleteBtn}
                  onPress={() => {
                    setHabitModalVisible(false);
                    confirmAlert(
                      t('common.delete'),
                      habitModalName,
                      () => deleteCustomHabit(habitModalId),
                      { cancel: t('common.cancel'), confirm: t('common.delete') },
                    );
                  }}
                >
                  <Text style={styles.modalDeleteText}>{t('common.delete')}</Text>
                </Pressable>
              )}
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
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
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
    },
    habitIcon: {
      fontSize: 20,
      marginEnd: 12,
    },
    habitInfo: {
      flex: 1,
      gap: 2,
    },
    habitName: {
      flex: 1,
      fontSize: 16,
      fontFamily: Fonts.regular,
      color: colors.text,
    },
    habitRowHidden: {
      opacity: 0.5,
    },
    habitNameHidden: {
      color: colors.textMuted,
    },
    builtinGoalLabel: {
      fontSize: 14,
      fontFamily: Fonts.semiBold,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    positionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
      marginBottom: 4,
    },
    positionControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    positionBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.bg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    positionBtnDisabled: {
      opacity: 0.3,
    },
    positionBtnText: {
      fontSize: 18,
      fontFamily: Fonts.semiBold,
      color: colors.text,
    },
    positionBtnTextDisabled: {
      color: colors.textMuted,
    },
    positionInput: {
      backgroundColor: colors.bg,
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 12,
      fontSize: 15,
      fontFamily: Fonts.semiBold,
      color: colors.text,
      textAlign: 'center',
      width: 48,
    },
    positionTotal: {
      fontSize: 14,
      fontFamily: Fonts.regular,
      color: colors.textMuted,
    },
    visibilityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      marginBottom: 8,
    },
    visibilityLabel: {
      fontSize: 15,
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
    addHabitPlaceholder: {
      flex: 1,
      color: colors.textMuted,
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
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      paddingHorizontal: 32,
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 24,
    },
    modalTitle: {
      fontSize: 20,
      fontFamily: Fonts.bold,
      color: colors.text,
      marginBottom: 20,
    },
    emojiNameRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 12,
    },
    emojiInput: {
      backgroundColor: colors.bg,
      borderRadius: 10,
      padding: 14,
      fontSize: 18,
      width: 52,
      textAlign: 'center',
    },
    nameInput: {
      flex: 1,
      marginBottom: 0,
    },
    modalInput: {
      backgroundColor: colors.bg,
      borderRadius: 10,
      padding: 14,
      fontSize: 15,
      fontFamily: Fonts.regular,
      color: colors.text,
      marginBottom: 12,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    modalCancelBtn: {
      flex: 1,
      padding: 14,
      borderRadius: 10,
      backgroundColor: colors.bg,
      alignItems: 'center',
    },
    modalCancelText: {
      fontSize: 15,
      fontFamily: Fonts.medium,
      color: colors.textSecondary,
    },
    modalSaveBtn: {
      flex: 1,
      padding: 14,
      borderRadius: 10,
      backgroundColor: colors.accent,
      alignItems: 'center',
    },
    modalSaveBtnDisabled: {
      opacity: 0.4,
    },
    modalSaveText: {
      fontSize: 15,
      fontFamily: Fonts.semiBold,
      color: '#fff',
    },
    modalSaveTextDisabled: {
      opacity: 0.6,
    },
    modalDeleteBtn: {
      marginTop: 16,
      padding: 12,
      alignItems: 'center',
    },
    modalDeleteText: {
      fontSize: 14,
      fontFamily: Fonts.medium,
      color: colors.danger,
    },
    bottomSpacer: {
      height: 60,
    },
  });
}
