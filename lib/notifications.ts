import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { UserNotification } from '../store/useStore';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ---------------------------------------------------------------------------
// Permissions
// ---------------------------------------------------------------------------

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return true;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function checkPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const { status } = await Notifications.getPermissionsAsync();
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

  // Cancel everything first, then re-schedule the enabled ones.
  await Notifications.cancelAllScheduledNotificationsAsync();

  const enabled = notifications.filter((n) => n.enabled);

  for (const n of enabled) {
    await scheduleOne(n);
  }
}

async function scheduleOne(notification: UserNotification): Promise<string> {
  const { schedule } = notification;

  let trigger: Notifications.NotificationTriggerInput;

  if (schedule.type === 'daily') {
    trigger = {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: schedule.hour,
      minute: schedule.minute,
    };
  } else {
    // interval – convert to seconds
    const totalSeconds = schedule.hours * 3600 + schedule.minutes * 60;
    trigger = {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(totalSeconds, 60), // minimum 60s
      repeats: true,
    };
  }

  return Notifications.scheduleNotificationAsync({
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
  await Notifications.cancelAllScheduledNotificationsAsync();
}
