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

export type TChatMessage = TApiSchema<"RoomMessageResponse">;
export type TChatMessagesPage = TApiSchema<"ListRoomMessagesResponse">;

/** Cache infinite query tin nhắn: trang 0 = mới nhất, mỗi trang mới nhất trước. */
export type TChatMessagesCache = { pages: TChatMessagesPage[]; pageParams: unknown[] };
