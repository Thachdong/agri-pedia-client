/** Tên event socket (api.md — Realtime). */
export const CHAT_EVENTS = {
  send: "chat.message.send",
  received: "chat.message.received",
  enterRoom: "chat.room.enter",
  leaveRoom: "chat.room.leave",
} as const;
