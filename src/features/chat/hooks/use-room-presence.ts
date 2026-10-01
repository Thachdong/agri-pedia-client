import { useEffect } from "react";
import { queryKeys, useAppQueryClient } from "@/shared/lib/query";
import { useRealtime } from "@/shared/lib/realtime";
import { CHAT_EVENTS } from "../constants/chat.constants";

/**
 * Đang xem room (`active` + có `roomId`) → socket `chat.room.enter`: server đánh dấu đã đọc mọi tin,
 * tin tới trong lúc mở cũng đọc luôn → refetch rooms (unread về 0). Thôi xem → `chat.room.leave`.
 * Vào lại sau khi socket nối lại (server đã leave mọi room lúc disconnect).
 */
export function useRoomPresence(roomId: string | null, active: boolean) {
  const { emit, status } = useRealtime();
  const client = useAppQueryClient();
  const connected = status === "connected";

  useEffect(() => {
    if (!roomId || !active || !connected) return;
    emit(CHAT_EVENTS.enterRoom, { roomId })
      .then(() => client.invalidateQueries({ queryKey: queryKeys.chat.rooms() }))
      .catch(() => undefined); // không vào được room: chỉ mất "đã đọc", tin vẫn hiển thị
    return () => {
      emit(CHAT_EVENTS.leaveRoom, { roomId }).catch(() => undefined);
    };
  }, [roomId, active, connected, emit, client]);
}
