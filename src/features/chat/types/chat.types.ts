import type { TApiSchema } from "@/shared/lib/http";

export type TChatRoom = TApiSchema<"ChatRoomResponse">;
export type TChatRoomsPage = TApiSchema<"ListMyChatRoomsResponse">;

/** Dữ liệu cache của infinite query rooms (cùng shape `InfiniteData` của react-query). */
export type TChatRoomsCache = { pages: TChatRoomsPage[]; pageParams: unknown[] };

/** Các trang đã gộp — menu + badge dùng chung. */
export type TChatRoomsView = {
  rooms: TChatRoom[];
  /** Tổng unread trên MỌI room (server tính, không chỉ trang đã tải). */
  totalUnread: number;
};
