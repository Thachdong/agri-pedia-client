import { http, type IHttpClient } from "@/shared/lib/http";
import type { TChatMessagesPage, TChatRoomsPage } from "../types/chat.types";

export const CHAT_ROOMS_PAGE_SIZE = 20;

export const getChatRooms = (cursor: string | undefined, client: IHttpClient = http) =>
  client.get<TChatRoomsPage>("/chat/rooms", { query: { cursor, limit: CHAT_ROOMS_PAGE_SIZE } });

export const CHAT_MESSAGES_PAGE_SIZE = 30;

/** Mới nhất trước; `nextCursor` → tin cũ hơn. Chỉ đọc, không đánh dấu đã đọc (socket `chat.room.enter` làm việc đó). */
export const getRoomMessages = (roomId: string, cursor: string | undefined, client: IHttpClient = http) =>
  client.get<TChatMessagesPage>(`/chat/rooms/${encodeURIComponent(roomId)}/messages`, {
    query: { cursor, limit: CHAT_MESSAGES_PAGE_SIZE },
  });
