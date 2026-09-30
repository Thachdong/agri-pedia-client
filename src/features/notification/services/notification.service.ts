import { http, type IHttpClient } from "@/shared/lib/http";
import type { TNotificationsPage } from "../types/notification.types";

export const NOTIFICATIONS_PAGE_SIZE = 20;

export const getNotifications = (cursor: string | undefined, client: IHttpClient = http) =>
  client.get<TNotificationsPage>("/notifications", { query: { cursor, limit: NOTIFICATIONS_PAGE_SIZE } });

/** 200, body rỗng — đã đọc rồi cũng 200; của user khác → 404 NOTIFICATION_NOT_FOUND. */
export const markNotificationRead = (notificationId: string, client: IHttpClient = http) =>
  client.patch<void>(`/notifications/${encodeURIComponent(notificationId)}/read`);

/** 200, body rỗng — mọi thông báo chưa đọc của người gọi → đã đọc. */
export const markAllNotificationsRead = (client: IHttpClient = http) => client.patch<void>("/notifications/read-all");
