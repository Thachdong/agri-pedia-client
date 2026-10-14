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

/** Thêm thông báo mới vào đầu trang 0 (mới nhất trước); bỏ qua nếu đã có (trùng id). */
export const prependNotification = (
  cache: TNotificationsCache | undefined,
  notification: TNotification,
): TNotificationsCache | undefined => {
  if (!cache) return cache;
  if (cache.pages.some((page) => page.notifications.some((item) => item.id === notification.id))) return cache;
  const [first, ...rest] = cache.pages;
  if (!first) return cache;
  return { ...cache, pages: [{ ...first, notifications: [notification, ...first.notifications] }, ...rest] };
};
