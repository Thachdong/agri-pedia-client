"use client";

import { BellIcon } from "lucide-react";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@/shared/components/atoms";
import { IconBadgeButton } from "@/shared/components/molecules";
import { useMarkAllNotificationsRead } from "../hooks/use-mark-all-notifications-read";
import { useMarkNotificationRead } from "../hooks/use-mark-notification-read";
import { useNotificationRealtime } from "../hooks/use-notification-realtime";
import { useNotifications } from "../hooks/use-notifications";
import type { TNotification } from "../types/notification.types";
import { NotificationItem } from "./notification-item";

const SKELETON_ROWS = 3;

/**
 * Header (1) — chuông + badge chưa đọc, popover danh sách thông báo (ui-ux.md §6).
 * Cần nằm trong RealtimeProvider để nhận thông báo mới tức thì.
 */
export function NotificationMenu() {
  useNotificationRealtime();
  const query = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const { data } = query;
  const unreadCount = data?.unreadCount ?? 0;

  const handleSelect = (notification: TNotification) => {
    if (!notification.isRead) markRead.mutate(notification.id);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <IconBadgeButton
          icon={<BellIcon aria-hidden />}
          label="Thông báo"
          count={unreadCount}
          countAtLeast={data?.unreadCountIsLowerBound}
        />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))] gap-0 p-0">
        <div className="flex items-center justify-between gap-2 border-b border-border-subtle px-3 py-2">
          <h2 className="text-sm font-semibold">Thông báo</h2>
          <Button
            variant="link"
            size="sm"
            className="h-auto px-0"
            disabled={unreadCount === 0 || markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            Đánh dấu đã đọc tất cả
          </Button>
        </div>

        <div className="scrollbar-thin max-h-96 overflow-y-auto p-1">
          {query.isPending ? (
            <ul className="flex flex-col gap-1 p-1" aria-busy aria-label="Đang tải thông báo">
              {Array.from({ length: SKELETON_ROWS }, (_, index) => (
                <li key={index} className="flex flex-col gap-1.5 px-1 py-2">
                  <div className="h-3.5 w-2/3 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-full animate-pulse rounded bg-muted" />
                </li>
              ))}
            </ul>
          ) : !data ? (
            <div role="alert" className="flex flex-col items-center gap-2 px-3 py-6 text-center text-sm text-muted-foreground">
              Không tải được thông báo.
              <Button variant="outline" size="sm" onClick={() => query.refetch()}>
                Thử lại
              </Button>
            </div>
          ) : data.items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">Chưa có thông báo nào.</p>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {data.items.map((notification) => (
                <li key={notification.id}>
                  <NotificationItem notification={notification} onSelect={handleSelect} />
                </li>
              ))}
              {query.hasNextPage && (
                <li className="flex justify-center py-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={query.isFetchingNextPage}
                    onClick={() => query.fetchNextPage()}
                  >
                    {query.isFetchNextPageError ? "Tải thêm thất bại — thử lại" : "Xem thêm"}
                  </Button>
                </li>
              )}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
