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
// Scheduling
// ---------------------------------------------------------------------------

/**
 * Cancel all scheduled notifications and re-schedule only the enabled ones.
 * This is the single source of truth for what gets scheduled on the OS.
 */
export async function syncNotifications(
  notifications: UserNotification[],
): Promise<void> {
  if (Platform.OS === 'web') return;

  await ensureHandler();
  const N = await getNotifications();

  // Cancel everything first, then re-schedule the enabled ones.
  await N.cancelAllScheduledNotificationsAsync();

  const enabled = notifications.filter((n) => n.enabled);

  for (const n of enabled) {
    await scheduleOne(N, n);
  }
}

async function scheduleOne(
  N: typeof import('expo-notifications'),
  notification: UserNotification,
): Promise<string> {
  const { schedule } = notification;

  let trigger: import('expo-notifications').NotificationTriggerInput;

  if (schedule.type === 'daily') {
    trigger = {
      type: N.SchedulableTriggerInputTypes.DAILY,
      hour: schedule.hour,
      minute: schedule.minute,
    };
  } else {
    // interval – convert to seconds
    const totalSeconds = schedule.hours * 3600 + schedule.minutes * 60;
    trigger = {
      type: N.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(totalSeconds, 60), // minimum 60s
      repeats: true,
    };
  }

  return N.scheduleNotificationAsync({
    content: {
      title: notification.title,
      body: notification.body,
    },
    trigger,
  });
}

/**
 * Cancel all scheduled notifications (e.g. when the user resets data).
 */
export async function cancelAll(): Promise<void> {
  if (Platform.OS === 'web') return;
  const N = await getNotifications();
  await N.cancelAllScheduledNotificationsAsync();
}
