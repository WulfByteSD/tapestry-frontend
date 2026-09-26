import type { INotification } from '@tapestry/types';

/**
 * Base resolver — returns null for all notification types.
 * Apps override this by wrapping with their own routing logic.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function resolveNotificationLink(_notification: INotification): string | null {
  return null;
}
