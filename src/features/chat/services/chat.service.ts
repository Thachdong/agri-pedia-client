import { http, type IHttpClient } from "@/shared/lib/http";
import type { TChatMessagesPage, TChatRoomsPage, TMessageDiagnosis } from "../types/chat.types";

export const CHAT_ROOMS_PAGE_SIZE = 20;

export const getChatRooms = (cursor: string | undefined, client: IHttpClient = http) =>
  client.get<TChatRoomsPage>("/chat/rooms", { query: { cursor, limit: CHAT_ROOMS_PAGE_SIZE } });

export const CHAT_MESSAGES_PAGE_SIZE = 30;

/** Mới nhất trước; `nextCursor` → tin cũ hơn. Chỉ đọc, không đánh dấu đã đọc (socket `chat.room.enter` làm việc đó). */
export const getRoomMessages = (roomId: string, cursor: string | undefined, client: IHttpClient = http) =>
  client.get<TChatMessagesPage>(`/chat/rooms/${encodeURIComponent(roomId)}/messages`, {
    query: { cursor, limit: CHAT_MESSAGES_PAGE_SIZE },
  });

/**
 * Chẩn đoán được chia sẻ bởi tin DIAGNOSIS_REPORT — 2 thành viên room đều đọc được; trạng thái hiện tại (không phải
 * lúc gửi), URL ảnh ký sẵn có hạn. Tin không phải report → 404 CHAT_MESSAGE_NOT_DIAGNOSIS_REPORT.
 */
export const getMessageDiagnosis = (roomId: string, messageId: string, client: IHttpClient = http) =>
  client.get<TMessageDiagnosis>(
    `/chat/rooms/${encodeURIComponent(roomId)}/messages/${encodeURIComponent(messageId)}/diagnosis`,
  );
