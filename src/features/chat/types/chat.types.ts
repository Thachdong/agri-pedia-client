import type { TDiagnosis } from "@/features/diagnosis";
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

export type TChatMessageType = TChatMessage["type"];

/**
 * Socket `chat.message.send` — không có trong openapi (socket), viết theo server
 * `SendChatMessageDto` / `SendChatMessageResponse`. `roomId` ưu tiên hơn `receiverId`.
 * DIAGNOSIS_REPORT (chỉ FARMER): chia sẻ 1 chẩn đoán COMPLETED của mình — `message` là text hiện kèm report.
 */
export type TSendMessageInput = { roomId?: string; receiverId?: string; message: string } & (
  | { type?: "TEXT"; diagnosisId?: never }
  | { type: "DIAGNOSIS_REPORT"; diagnosisId: string }
);
/** Ack thành công; `createdAt` là ISO string (qua JSON). */
export type TSendMessageAck = { messageId: string; roomId: string; createdAt: string };

/** Giá trị form gửi tin trong Chat modal (room / receiver do modal quyết định). */
export type TChatMessageFormValues = Pick<TSendMessageInput, "message">;

/**
 * Socket `chat.message.received` (server → người còn lại trong room) — viết theo server
 * `TChatMessageReceivedRealtimePayload`; `createdAt` ISO string.
 */
export type TChatMessageReceivedEvent = {
  messageId: string;
  roomId: string;
} & Omit<TChatMessage, "id">;

/**
 * GET /chat/rooms/:roomId/messages/:messageId/diagnosis — cùng body với GET /diagnoses/:id (swagger để enum là
 * string) nên dùng chung TDiagnosis để render bằng component của feature diagnosis.
 */
export type TMessageDiagnosis = TDiagnosis;
