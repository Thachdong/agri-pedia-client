import { useRef } from "react";
import { queryKeys, useAppQueryClient } from "@/shared/lib/query";
import { useRealtimeEvent } from "@/shared/lib/realtime";
import { CHAT_EVENTS } from "../constants/chat.constants";
import type { TChatMessageReceivedEvent, TChatMessagesCache } from "../types/chat.types";
import { prependMessage } from "../utils/chat-cache.util";

/**
 * Đồng bộ cache chat với socket (cần nằm trong RealtimeProvider):
 * - `chat.message.received` → thêm tin vào cache room (nếu room đã tải) + refetch danh sách room (lastMessage, unread, thứ tự).
 * - Kết nối LẠI sau khi rớt → refetch toàn bộ chat, vì server không push lại tin lúc offline.
 */
export function useChatRealtime() {
  const client = useAppQueryClient();
  const hasConnected = useRef(false);

  useRealtimeEvent<TChatMessageReceivedEvent>(CHAT_EVENTS.received, ({ messageId, roomId, senderId, message, createdAt }) => {
    client.setQueryData<TChatMessagesCache>(queryKeys.chat.messages(roomId), (cache) =>
      prependMessage(cache, { id: messageId, senderId, message, createdAt }),
    );
    void client.invalidateQueries({ queryKey: queryKeys.chat.rooms() });
  });

  useRealtimeEvent("connect", () => {
    if (hasConnected.current) void client.invalidateQueries({ queryKey: queryKeys.chat.all });
    hasConnected.current = true;
  });
}
