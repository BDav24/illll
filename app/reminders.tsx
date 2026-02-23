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
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import i18n from '../lib/i18n';

import { useColors, type ColorPalette } from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { generateDefaultNotifications } from '../constants/notifications';
import {
  useStore,
  type UserNotification,
  type NotificationSchedule,
} from '../store/useStore';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

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

function generateId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// Editor sub-component
// ---------------------------------------------------------------------------

type EditorProps = {
  notification: UserNotification | null; // null = creating new
  onSave: (n: UserNotification) => void;
  onCancel: () => void;
  colors: ColorPalette;
  styles: ReturnType<typeof makeStyles>;
};

function ReminderEditor({ notification, onSave, onCancel, colors, styles }: EditorProps) {
  const { t } = useTranslation();

  const isNew = notification === null;

  const [title, setTitle] = useState(notification?.title ?? '');
  const [body, setBody] = useState(notification?.body ?? '');
  const [scheduleType, setScheduleType] = useState<'daily' | 'interval'>(
    notification?.schedule.type ?? 'daily',
  );
  const [hour, setHour] = useState(
    notification?.schedule.type === 'daily' ? notification.schedule.hour : 8,
  );
  const [minute, setMinute] = useState(
    notification?.schedule.type === 'daily' ? notification.schedule.minute : 0,
  );
  const [intervalHours, setIntervalHours] = useState(
    notification?.schedule.type === 'interval' ? notification.schedule.hours : 2,
  );
  const [intervalMinutes, setIntervalMinutes] = useState(
    notification?.schedule.type === 'interval' ? notification.schedule.minutes : 0,
  );

  const handleSave = useCallback(() => {
    const trimTitle = title.trim();
    const trimBody = body.trim();
    if (!trimTitle) return;
    if (scheduleType === 'interval' && intervalHours === 0 && intervalMinutes === 0) return;

    const schedule: NotificationSchedule =
      scheduleType === 'daily'
        ? { type: 'daily', hour, minute }
        : { type: 'interval', hours: intervalHours, minutes: intervalMinutes };

    onSave({
      id: notification?.id ?? generateId(),
      title: trimTitle,
      body: trimBody,
      schedule,
      enabled: notification?.enabled ?? true,
      isDefault: false,
    });
  }, [
    title,
    body,
    scheduleType,
    hour,
    minute,
    intervalHours,
    intervalMinutes,
    notification,
    onSave,
  ]);

  return (
    <View style={styles.editor}>
      <Text style={styles.editorTitle} accessibilityRole="header">
        {isNew ? t('notifications.addReminder') : t('notifications.editReminder')}
      </Text>

      {/* Title input */}
      <TextInput
        style={styles.input}
        placeholder={t('notifications.titlePlaceholder')}
        placeholderTextColor={colors.textMuted}
        value={title}
        onChangeText={setTitle}
        accessibilityLabel={t('notifications.titlePlaceholder')}
      />

      {/* Body input */}
      <TextInput
        style={[styles.input, styles.inputMultiline]}
        placeholder={t('notifications.bodyPlaceholder')}
        placeholderTextColor={colors.textMuted}
        value={body}
        onChangeText={setBody}
        multiline
        numberOfLines={2}
        accessibilityLabel={t('notifications.bodyPlaceholder')}
      />

      {/* Schedule type toggle */}
      <View style={styles.scheduleTypeRow}>
        <Pressable
          style={[
            styles.scheduleTypeBtn,
            scheduleType === 'daily' && styles.scheduleTypeBtnActive,
          ]}
          onPress={() => setScheduleType('daily')}
          accessibilityRole="radio"
          accessibilityState={{ selected: scheduleType === 'daily' }}
        >
          <Text
            style={[
              styles.scheduleTypeText,
              scheduleType === 'daily' && styles.scheduleTypeTextActive,
            ]}
          >
            {t('notifications.daily')}
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.scheduleTypeBtn,
            scheduleType === 'interval' && styles.scheduleTypeBtnActive,
          ]}
          onPress={() => setScheduleType('interval')}
          accessibilityRole="radio"
          accessibilityState={{ selected: scheduleType === 'interval' }}
        >
          <Text
            style={[
              styles.scheduleTypeText,
              scheduleType === 'interval' && styles.scheduleTypeTextActive,
            ]}
          >
            {t('notifications.interval')}
          </Text>
        </Pressable>
      </View>

      {/* Schedule values */}
      {scheduleType === 'daily' ? (
        <View style={styles.timeRow}>
          <View style={styles.timeField}>
            <Text style={styles.timeLabel}>{t('notifications.hour')}</Text>
            <View style={styles.stepperRow}>
              <Pressable
                style={styles.stepperBtn}
                onPress={() => setHour((h) => (h > 0 ? h - 1 : 23))}
                accessibilityLabel={t('accessibility.decreaseHour')}
                hitSlop={4}
              >
                <Text style={styles.stepperText}>-</Text>
              </Pressable>
              <Text style={styles.timeValue}>{pad(hour)}</Text>
              <Pressable
                style={styles.stepperBtn}
                onPress={() => setHour((h) => (h < 23 ? h + 1 : 0))}
                accessibilityLabel={t('accessibility.increaseHour')}
                hitSlop={4}
              >
                <Text style={styles.stepperText}>+</Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.timeSeparator}>:</Text>

          <View style={styles.timeField}>
            <Text style={styles.timeLabel}>{t('notifications.minute')}</Text>
            <View style={styles.stepperRow}>
              <Pressable
                style={styles.stepperBtn}
                onPress={() => setMinute((m) => (m > 0 ? m - 5 : 55))}
                accessibilityLabel={t('accessibility.decreaseMinute')}
                hitSlop={4}
              >
                <Text style={styles.stepperText}>-</Text>
              </Pressable>
              <Text style={styles.timeValue}>{pad(minute)}</Text>
              <Pressable
                style={styles.stepperBtn}
                onPress={() => setMinute((m) => (m < 55 ? m + 5 : 0))}
                accessibilityLabel={t('accessibility.increaseMinute')}
                hitSlop={4}
              >
                <Text style={styles.stepperText}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.timeRow}>
          <View style={styles.timeField}>
            <Text style={styles.timeLabel}>{t('notifications.hours')}</Text>
            <View style={styles.stepperRow}>
              <Pressable
                style={styles.stepperBtn}
                onPress={() => setIntervalHours((h) => Math.max(0, h - 1))}
                accessibilityLabel={t('accessibility.decreaseHours')}
                hitSlop={4}
              >
                <Text style={styles.stepperText}>-</Text>
              </Pressable>
              <Text style={styles.timeValue}>{intervalHours}</Text>
              <Pressable
                style={styles.stepperBtn}
                onPress={() => setIntervalHours((h) => Math.min(24, h + 1))}
                accessibilityLabel={t('accessibility.increaseHours')}
                hitSlop={4}
              >
                <Text style={styles.stepperText}>+</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.timeField}>
            <Text style={styles.timeLabel}>{t('notifications.minutes')}</Text>
            <View style={styles.stepperRow}>
              <Pressable
                style={styles.stepperBtn}
                onPress={() =>
                  setIntervalMinutes((m) => (m > 0 ? m - 15 : 45))
                }
                accessibilityLabel={t('accessibility.decreaseMinutes')}
                hitSlop={4}
              >
                <Text style={styles.stepperText}>-</Text>
              </Pressable>
              <Text style={styles.timeValue}>{intervalMinutes}</Text>
              <Pressable
                style={styles.stepperBtn}
                onPress={() =>
                  setIntervalMinutes((m) => (m < 45 ? m + 15 : 0))
                }
                accessibilityLabel={t('accessibility.increaseMinutes')}
                hitSlop={4}
              >
                <Text style={styles.stepperText}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.editorActions}>
        <Pressable style={styles.cancelBtn} onPress={onCancel} accessibilityRole="button">
          <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
        </Pressable>
        <Pressable
          style={[styles.saveBtn, (!title.trim() || (scheduleType === 'interval' && intervalHours === 0 && intervalMinutes === 0)) && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!title.trim() || (scheduleType === 'interval' && intervalHours === 0 && intervalMinutes === 0)}
          accessibilityRole="button"
        >
          <Text style={styles.saveBtnText}>{t('common.save')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function RemindersScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const notifications = useStore((s) => s.settings.notifications) ?? [];
  const addNotification = useStore((s) => s.addNotification);
  const updateNotification = useStore((s) => s.updateNotification);
  const deleteNotification = useStore((s) => s.deleteNotification);
  const toggleNotification = useStore((s) => s.toggleNotification);
  const setNotifications = useStore((s) => s.setNotifications);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // On first toggle-on, request permission
  const handleToggle = useCallback(
    async (id: string) => {
      const n = notifications.find((x) => x.id === id);
      if (n && !n.enabled) {
        const { requestPermissions } = await import('../lib/notifications');
        const granted = await requestPermissions();
        if (!granted) {
          Alert.alert(
            t('notifications.permissionRequired'),
            t('notifications.permissionDenied'),
          );
          return;
        }
      }
      toggleNotification(id);
    },
    [notifications, t, toggleNotification],
  );

  // Seed default reminders on first visit (all disabled)
  const handleSeedDefaults = useCallback(() => {
    setNotifications(generateDefaultNotifications(t));
  }, [t, setNotifications]);

  const handleAdd = useCallback(async () => {
    const { requestPermissions } = await import('../lib/notifications');
    const granted = await requestPermissions();
    if (!granted) {
      Alert.alert(
        t('notifications.permissionRequired'),
        t('notifications.permissionDenied'),
      );
      return;
    }
    setIsCreating(true);
  }, [t]);

  const handleSaveNew = useCallback(
    (n: UserNotification) => {
      addNotification(n);
      setIsCreating(false);
    },
    [addNotification],
  );

  const handleSaveEdit = useCallback(
    (n: UserNotification) => {
      updateNotification(n.id, {
        title: n.title,
        body: n.body,
        schedule: n.schedule,
        enabled: n.enabled,
        isDefault: false,
      });
      setEditingId(null);
    },
    [updateNotification],
  );

  const handleDelete = useCallback(
    (id: string) => {
      confirmAlert(
        t('notifications.deleteReminder'),
        t('notifications.deleteConfirm'),
        () => deleteNotification(id),
        { cancel: t('common.cancel'), confirm: t('common.delete') },
      );
    },
    [t, deleteNotification],
  );

  const handleClose = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [router]);

  const editingNotification = editingId
    ? notifications.find((n) => n.id === editingId) ?? null
    : null;

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
          <Text style={styles.title} accessibilityRole="header">
            {t('notifications.title')}
          </Text>
          <Pressable
            onPress={handleClose}
            style={styles.closeBtn}
            accessibilityRole="button"
            accessibilityLabel={t('accessibility.close')}
            hitSlop={4}
          >
            <Text style={styles.closeText}>{'\u2715'}</Text>
          </Pressable>
        </View>

        {/* Empty state */}
        {notifications.length === 0 && !isCreating && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>{'\u{1F514}'}</Text>
            <Text style={styles.emptyText}>
              {t('settings.manageReminders')}
            </Text>
            <Pressable
              style={styles.seedBtn}
              onPress={handleSeedDefaults}
              accessibilityRole="button"
            >
              <Text style={styles.seedBtnText}>
                {t('notifications.addReminder')}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Notification list */}
        {notifications.map((n) => {
          if (editingId === n.id) {
            return (
              <ReminderEditor
                key={n.id}
                notification={editingNotification}
                onSave={handleSaveEdit}
                onCancel={() => setEditingId(null)}
                colors={colors}
                styles={styles}
              />
            );
          }

          const scheduleLabel =
            n.schedule.type === 'daily'
              ? t('notifications.scheduleDaily', {
                  hour: pad(n.schedule.hour),
                  minute: pad(n.schedule.minute),
                })
              : t('notifications.scheduleInterval', {
                  hours: n.schedule.hours,
                  minutes: pad(n.schedule.minutes),
                });

          return (
            <View key={n.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{n.title}</Text>
                  {n.body ? (
                    <Text style={styles.cardBody} numberOfLines={1}>
                      {n.body}
                    </Text>
                  ) : null}
                  <Text style={styles.cardSchedule}>{scheduleLabel}</Text>
                </View>
                <Switch
                  value={n.enabled}
                  onValueChange={() => handleToggle(n.id)}
                  trackColor={{
                    false: colors.border,
                    true: colors.accent + '80',
                  }}
                  thumbColor={n.enabled ? colors.accent : colors.textMuted}
                  accessibilityLabel={n.title}
                />
              </View>

              <View style={styles.cardActions}>
                <Pressable
                  style={styles.actionBtn}
                  onPress={() => setEditingId(n.id)}
                  accessibilityRole="button"
                  hitSlop={4}
                >
                  <Text style={styles.actionText}>{t('common.edit')}</Text>
                </Pressable>
                <Pressable
                  style={styles.actionBtn}
                  onPress={() => handleDelete(n.id)}
                  accessibilityRole="button"
                  hitSlop={4}
                >
                  <Text style={[styles.actionText, styles.deleteText]}>
                    {t('common.delete')}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })}

        {/* Editor for new reminder */}
        {isCreating && (
          <ReminderEditor
            notification={null}
            onSave={handleSaveNew}
            onCancel={() => setIsCreating(false)}
            colors={colors}
            styles={styles}
          />
        )}

        {/* Add button (when list is non-empty and not editing) */}
        {notifications.length > 0 && !isCreating && !editingId && (
          <Pressable
            style={styles.addBtn}
            onPress={handleAdd}
            accessibilityRole="button"
          >
            <Text style={styles.addBtnText}>
              + {t('notifications.addReminder')}
            </Text>
          </Pressable>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

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

    // Empty state
    emptyState: {
      alignItems: 'center',
      paddingVertical: 48,
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: 16,
    },
    emptyText: {
      fontSize: 15,
      fontFamily: Fonts.regular,
      color: colors.textMuted,
      textAlign: 'center',
      marginBottom: 24,
    },
    seedBtn: {
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 28,
    },
    seedBtnText: {
      fontSize: 15,
      fontFamily: Fonts.semiBold,
      color: '#FFFFFF',
    },

    // Card
    card: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 16,
      marginBottom: 10,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    cardInfo: {
      flex: 1,
      marginEnd: 12,
    },
    cardTitle: {
      fontSize: 16,
      fontFamily: Fonts.semiBold,
      color: colors.text,
      marginBottom: 2,
    },
    cardBody: {
      fontSize: 13,
      fontFamily: Fonts.regular,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    cardSchedule: {
      fontSize: 13,
      fontFamily: Fonts.regular,
      color: colors.textMuted,
    },
    cardActions: {
      flexDirection: 'row',
      marginTop: 10,
      gap: 16,
    },
    actionBtn: {
      paddingVertical: 4,
    },
    actionText: {
      fontSize: 14,
      fontFamily: Fonts.medium,
      color: colors.accent,
    },
    deleteText: {
      color: colors.danger,
    },

    // Add button
    addBtn: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
      marginTop: 4,
    },
    addBtnText: {
      fontSize: 15,
      fontFamily: Fonts.semiBold,
      color: colors.accent,
    },

    // Editor
    editor: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 16,
      marginBottom: 10,
    },
    editorTitle: {
      fontSize: 17,
      fontFamily: Fonts.semiBold,
      color: colors.text,
      marginBottom: 14,
    },
    input: {
      backgroundColor: colors.bg,
      borderRadius: 10,
      padding: 12,
      fontSize: 15,
      fontFamily: Fonts.regular,
      color: colors.text,
      marginBottom: 10,
    },
    inputMultiline: {
      minHeight: 56,
      textAlignVertical: 'top',
    },

    // Schedule type
    scheduleTypeRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 14,
    },
    scheduleTypeBtn: {
      flex: 1,
      backgroundColor: colors.bg,
      borderRadius: 10,
      paddingVertical: 10,
      alignItems: 'center',
    },
    scheduleTypeBtnActive: {
      backgroundColor: colors.accent + '20',
      borderColor: colors.accent,
      borderWidth: 1,
    },
    scheduleTypeText: {
      fontSize: 14,
      fontFamily: Fonts.regular,
      color: colors.textSecondary,
    },
    scheduleTypeTextActive: {
      color: colors.accent,
      fontFamily: Fonts.semiBold,
    },

    // Time picker
    timeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      marginBottom: 16,
    },
    timeField: {
      alignItems: 'center',
    },
    timeLabel: {
      fontSize: 12,
      fontFamily: Fonts.medium,
      color: colors.textMuted,
      marginBottom: 6,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    stepperRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    stepperBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.bg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepperText: {
      fontSize: 20,
      fontFamily: Fonts.semiBold,
      color: colors.text,
      lineHeight: 22,
    },
    timeValue: {
      fontSize: 24,
      fontFamily: Fonts.bold,
      color: colors.text,
      minWidth: 36,
      textAlign: 'center',
    },
    timeSeparator: {
      fontSize: 24,
      fontFamily: Fonts.bold,
      color: colors.textMuted,
      marginTop: 20,
    },

    // Editor actions
    editorActions: {
      flexDirection: 'row',
      gap: 10,
    },
    cancelBtn: {
      flex: 1,
      backgroundColor: colors.bg,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: 'center',
    },
    cancelBtnText: {
      fontSize: 15,
      fontFamily: Fonts.medium,
      color: colors.textSecondary,
    },
    saveBtn: {
      flex: 1,
      backgroundColor: colors.accent,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: 'center',
    },
    saveBtnDisabled: {
      opacity: 0.5,
    },
    saveBtnText: {
      fontSize: 15,
      fontFamily: Fonts.semiBold,
      color: '#FFFFFF',
    },

    bottomSpacer: {
      height: 60,
    },
  });
}
