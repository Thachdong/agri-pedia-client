// Public API của feature `chat` (danh sách room, tin nhắn, chat modal, realtime).
export { ChatModal, type TChatModalProps, type TChatTarget } from "./components/chat-modal";
export { chatRoomsQuery, roomMessagesQuery } from "./hooks/chat.queries";
export { useChatRooms } from "./hooks/use-chat-rooms";
export { useRoomMessages } from "./hooks/use-room-messages";
export { useSendMessage } from "./hooks/use-send-message";
export type { TChatMessage, TChatRoom, TChatRoomsView, TSendMessageAck, TSendMessageInput } from "./types/chat.types";
