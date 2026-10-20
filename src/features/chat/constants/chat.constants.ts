/** Tên event socket (api.md — Realtime). */
export const CHAT_EVENTS = {
  send: "chat.message.send",
  received: "chat.message.received",
  enterRoom: "chat.room.enter",
  leaveRoom: "chat.room.leave",
} as const;

/** Tên hiển thị khi room không có `otherUsername`. */
export const CHAT_UNKNOWN_USER_NAME = "Người dùng";

/** Nhãn tin DIAGNOSIS_REPORT — đầu text tin, bong bóng và preview tin cuối. */
export const CHAT_REPORT_LABEL = "Báo cáo chẩn đoán";
