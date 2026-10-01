import type { TApiSchema } from "@/shared/lib/http";

export type TNotification = TApiSchema<"NotificationResponse">;
export type TNotificationsPage = TApiSchema<"ListMyNotificationsResponse">;

/** Dữ liệu cache của infinite query (cùng shape `InfiniteData` của react-query). */
export type TNotificationsCache = { pages: TNotificationsPage[]; pageParams: unknown[] };

/** Các trang đã gộp — menu + badge dùng chung. */
export type TNotificationsView = {
  items: TNotification[];
  /** Đếm trên các trang đã tải (API không có tổng unread). */
  unreadCount: number;
  /** Còn trang chưa tải và mọi item đã tải đều chưa đọc → số thật có thể lớn hơn ("20+"). */
  unreadCountIsLowerBound: boolean;
};
