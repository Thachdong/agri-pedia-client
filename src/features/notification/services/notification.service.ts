import { http, type IHttpClient } from "@/shared/lib/http";
import type { TNotificationsPage } from "../types/notification.types";

export const NOTIFICATIONS_PAGE_SIZE = 20;

export const getNotifications = (cursor: string | undefined, client: IHttpClient = http) =>
  client.get<TNotificationsPage>("/notifications", { query: { cursor, limit: NOTIFICATIONS_PAGE_SIZE } });
