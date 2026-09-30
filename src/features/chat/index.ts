// Public API của feature `chat` (danh sách room, tin nhắn, chat modal, realtime).
export { chatRoomsQuery } from "./hooks/chat.queries";
export { useChatRooms } from "./hooks/use-chat-rooms";
export type { TChatRoom, TChatRoomsView } from "./types/chat.types";
