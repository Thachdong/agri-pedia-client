// Public API của feature `chat` (danh sách room, tin nhắn, chat modal, realtime).
export { ChatModal, type TChatModalProps, type TChatTarget } from "./components/chat-modal";
export { ChatRoomItem, type TChatRoomItemProps } from "./components/chat-room-item";
export { ChatRoomsMenu } from "./components/chat-rooms-menu";
export { chatRoomsQuery, messageDiagnosisQuery, roomMessagesQuery } from "./hooks/chat.queries";
export { useChatRooms } from "./hooks/use-chat-rooms";
export { useMessageDiagnosis } from "./hooks/use-message-diagnosis";
export { useRoomMessages } from "./hooks/use-room-messages";
export { useSendMessage } from "./hooks/use-send-message";
export { formatReportMessage } from "./utils/report-message.util";
export type {
  TChatMessage,
  TChatMessageType,
  TChatRoom,
  TChatRoomsView,
  TMessageDiagnosis,
  TSendMessageAck,
  TSendMessageInput,
} from "./types/chat.types";
