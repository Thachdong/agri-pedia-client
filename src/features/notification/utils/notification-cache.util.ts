import type { TNotification, TNotificationsCache } from "../types/notification.types";

/** Đổi `isRead` của các item thoả `match` — trả object mới (immutable) cho setQueryData. */
export const markReadInCache = (
  cache: TNotificationsCache | undefined,
  match: (item: TNotification) => boolean,
): TNotificationsCache | undefined =>
  cache && {
    ...cache,
    pages: cache.pages.map((page) => ({
      ...page,
      notifications: page.notifications.map((item) => (!item.isRead && match(item) ? { ...item, isRead: true } : item)),
    })),
  };
