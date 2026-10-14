import { useRef } from "react";
import { queryKeys, useAppQueryClient } from "@/shared/lib/query";
import { useRealtimeEvent } from "@/shared/lib/realtime";
import { NOTIFICATION_EVENTS } from "../constants/notification.constants";
import type { TNotification, TNotificationsCache } from "../types/notification.types";
import { prependNotification } from "../utils/notification-cache.util";

/**
 * Đồng bộ cache notifications với socket (cần nằm trong RealtimeProvider):
 * - `notification.created` → thêm vào đầu danh sách (badge tăng ngay).
 * - Kết nối LẠI sau khi rớt → refetch, vì server không push lại event lúc offline.
 */
export function useNotificationRealtime() {
  const client = useAppQueryClient();
  const hasConnected = useRef(false);

  useRealtimeEvent<TNotification>(NOTIFICATION_EVENTS.created, (notification) => {
    client.setQueryData<TNotificationsCache>(queryKeys.notifications.list(), (cache) =>
      prependNotification(cache, notification),
    );
  });

  useRealtimeEvent("connect", () => {
    if (hasConnected.current) void client.invalidateQueries({ queryKey: queryKeys.notifications.all });
    hasConnected.current = true;
  });
}
