// Public API của feature `notification` (danh sách + đánh dấu đã đọc + realtime).
export { notificationsQuery } from "./hooks/notification.queries";
export { useMarkNotificationRead } from "./hooks/use-mark-notification-read";
export { useNotifications } from "./hooks/use-notifications";
export type { TNotification, TNotificationsView } from "./types/notification.types";
