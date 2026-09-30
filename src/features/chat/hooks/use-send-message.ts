import { queryKeys, useAppMutation } from "@/shared/lib/query";
import { useRealtime } from "@/shared/lib/realtime";
import { CHAT_EVENTS } from "../constants/chat.constants";
import type { TChatMessagesCache, TSendMessageAck, TSendMessageInput } from "../types/chat.types";
import { prependMessage } from "../utils/chat-cache.util";

/**
 * Gửi tin qua socket (chờ ack). Thành công: thêm tin vào cache của room (server không gửi lại
 * `chat.message.received` cho người gửi) + invalidate danh sách room (lastMessage, thứ tự).
 * Gửi bằng `receiverId` (chưa có room) → ack trả `roomId` mới; bên gọi chuyển sang room đó.
 * @param senderId id người đang đăng nhập (useMe).
 */
export const useSendMessage = (senderId: string) => {
  const { emit } = useRealtime();
  return useAppMutation({
    mutationFn: (input: TSendMessageInput) =>
      emit<TSendMessageAck, TSendMessageInput>(CHAT_EVENTS.send, { ...input, message: input.message.trim() }),
    // Lỗi hiển thị ngay trong khung chat.
    meta: { silent: true },
    invalidates: () => [queryKeys.chat.rooms()],
    onSuccess: (ack, input, _onMutateResult, { client }) => {
      client.setQueryData<TChatMessagesCache>(queryKeys.chat.messages(ack.roomId), (cache) =>
        prependMessage(cache, { id: ack.messageId, senderId, message: input.message.trim(), createdAt: ack.createdAt }),
      );
    },
  });
};
