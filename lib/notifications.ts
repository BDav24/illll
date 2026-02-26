import { Platform } from 'react-native';
import type { UserNotification } from '../store/useStore';

// ---------------------------------------------------------------------------
// Lazy loader
// ---------------------------------------------------------------------------

let Notifications: typeof import('expo-notifications') | null = null;

async function getNotifications() {
  if (!Notifications) {
    Notifications = await import('expo-notifications');
  }
  return Notifications;
}

// ---------------------------------------------------------------------------
// Configuration (deferred until first use)
// ---------------------------------------------------------------------------

let handlerSet = false;

async function ensureHandler() {
  if (handlerSet) return;
  const N = await getNotifications();
  N.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  handlerSet = true;
}

// ---------------------------------------------------------------------------
// Permissions
// ---------------------------------------------------------------------------

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return true;

  const N = await getNotifications();
  const { status: existing } = await N.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await N.requestPermissionsAsync();
  return status === 'granted';
}

export async function checkPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const N = await getNotifications();
  const { status } = await N.getPermissionsAsync();
  return status === 'granted';
}

// ---------------------------------------------------------------------------
// Quiet hours helpers
// ---------------------------------------------------------------------------

export type QuietHoursSettings = {
  enabled: boolean;
  start: number; // minutes from midnight (0-1439)
  end: number;   // minutes from midnight (0-1439)
};

/** Check if a given minute-of-day falls within the quiet window. */
export function isInQuietHours(minuteOfDay: number, start: number, end: number): boolean {
  if (start === end) return false; // no quiet window
  if (start < end) {
    // e.g. 01:00 – 06:00  (60 – 360)
    return minuteOfDay >= start && minuteOfDay < end;
  }
  // wraps midnight, e.g. 22:00 – 08:00  (1320 – 480)
  return minuteOfDay >= start || minuteOfDay < end;
}

/**
 * Convert an interval schedule (e.g. every 2h) into an array of daily
 * {hour, minute} slots that fall outside the quiet window.
 * quietStart / quietEnd are minutes from midnight.
 */
export function expandIntervalToDailySlots(
  intervalHours: number,
  intervalMinutes: number,
  quietStart: number,
  quietEnd: number,
): { hour: number; minute: number }[] {
  const intervalTotalMinutes = intervalHours * 60 + intervalMinutes;
  if (intervalTotalMinutes <= 0) return [];

  const slots: { hour: number; minute: number }[] = [];

  // Walk every slot across 24h starting from quietEnd (the first active minute)
  for (let m = quietEnd; m < quietEnd + 24 * 60; m += intervalTotalMinutes) {
    const normalised = m % (24 * 60);
    const hour = Math.floor(normalised / 60);
    const minute = normalised % 60;
    if (!isInQuietHours(normalised, quietStart, quietEnd)) {
      slots.push({ hour, minute });
    }
  }

  return slots;
}

// ---------------------------------------------------------------------------
// Scheduling
// ---------------------------------------------------------------------------

/**
 * Cancel all scheduled notifications and re-schedule only the enabled ones.
 * This is the single source of truth for what gets scheduled on the OS.
 */
export async function syncNotifications(
  notifications: UserNotification[],
  quietHours?: QuietHoursSettings,
): Promise<void> {
  if (Platform.OS === 'web') return;

  await ensureHandler();
  const N = await getNotifications();

  // Cancel everything first, then re-schedule the enabled ones.
  await N.cancelAllScheduledNotificationsAsync();

  const enabled = notifications.filter((n) => n.enabled);

  for (const n of enabled) {
    await scheduleOne(N, n, quietHours);
  }
}

async function scheduleOne(
  N: typeof import('expo-notifications'),
  notification: UserNotification,
  quietHours?: QuietHoursSettings,
): Promise<void> {
  const { schedule } = notification;
  const qh = quietHours?.enabled ? quietHours : undefined;

  if (schedule.type === 'daily') {
    // If this daily notification falls within quiet hours, skip it entirely
    if (qh && isInQuietHours(schedule.hour * 60 + schedule.minute, qh.start, qh.end)) {
      return;
    }

    await N.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
      },
      trigger: {
        type: N.SchedulableTriggerInputTypes.DAILY,
        hour: schedule.hour,
        minute: schedule.minute,
      },
    });
  } else if (qh) {
    // Interval + quiet hours enabled → expand to multiple daily triggers
    const slots = expandIntervalToDailySlots(
      schedule.hours,
      schedule.minutes,
      qh.start,
      qh.end,
    );

    for (const slot of slots) {
      await N.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
        },
        trigger: {
          type: N.SchedulableTriggerInputTypes.DAILY,
          hour: slot.hour,
          minute: slot.minute,
        },
      });
    }
  } else {
    // Interval without quiet hours → use TIME_INTERVAL as before
    const totalSeconds = schedule.hours * 3600 + schedule.minutes * 60;
    await N.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
      },
      trigger: {
        type: N.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(totalSeconds, 60),
        repeats: true,
      },
    });
  }
}

/**
 * Cancel all scheduled notifications (e.g. when the user resets data).
 */
export async function cancelAll(): Promise<void> {
  if (Platform.OS === 'web') return;
  const N = await getNotifications();
  await N.cancelAllScheduledNotificationsAsync();
}
