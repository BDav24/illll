import type { TFunction } from 'i18next';
import type { UserNotification, NotificationSchedule } from '../store/useStore';

// ---------------------------------------------------------------------------
// Default reminder definitions
// ---------------------------------------------------------------------------

interface DefaultDef {
  key: string;
  schedule: NotificationSchedule;
}

const DEFAULTS: DefaultDef[] = [
  {
    key: 'morning',
    schedule: { type: 'daily', hour: 8, minute: 0 },
  },
  {
    key: 'evening',
    schedule: { type: 'daily', hour: 21, minute: 0 },
  },
  {
    key: 'move',
    schedule: { type: 'interval', hours: 2, minutes: 0 },
  },
];

export function generateDefaultNotifications(
  t: TFunction,
): UserNotification[] {
  return DEFAULTS.map((def) => ({
    id: `default_${def.key}`,
    title: t(`notifications.defaults.${def.key}.title`),
    body: t(`notifications.defaults.${def.key}.body`),
    schedule: def.schedule,
    enabled: false,
    isDefault: true,
    defaultKey: def.key,
  }));
}

/**
 * Re-translate default notifications that the user hasn't edited.
 * Returns a new array with updated text for unedited defaults.
 */
export function retranslateDefaults(
  current: UserNotification[],
  t: TFunction,
): UserNotification[] {
  return current.map((n) => {
    if (n.isDefault && n.defaultKey) {
      return {
        ...n,
        title: t(`notifications.defaults.${n.defaultKey}.title`),
        body: t(`notifications.defaults.${n.defaultKey}.body`),
      };
    }
    return n;
  });
}
