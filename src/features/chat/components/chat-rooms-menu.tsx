"use client";

import { MessageCircleIcon } from "lucide-react";
import { useState } from "react";
import { useMe } from "@/features/user";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@/shared/components/atoms";
import { IconBadgeButton } from "@/shared/components/molecules";
import { useChatRealtime } from "../hooks/use-chat-realtime";
import { useChatRooms } from "../hooks/use-chat-rooms";
import type { TChatRoom } from "../types/chat.types";
import { ChatModal } from "./chat-modal";
import { ChatRoomItem } from "./chat-room-item";

const SKELETON_ROWS = 3;

/**
 * Header (2) — icon chat + badge tổng tin chưa đọc, popover danh sách room; chọn room → Chat modal (ui-ux.md §6, §7 M2).
 * Cần nằm trong RealtimeProvider (tin mới, gửi tin).
 */
export function ChatRoomsMenu() {
  useChatRealtime();
  const { data: me } = useMe();
  const query = useChatRooms();
  const { data } = query;
  const [open, setOpen] = useState(false);
  const [activeRoom, setActiveRoom] = useState<TChatRoom | null>(null);
  const currentUserId = me?.id ?? "";

  const handleSelect = (room: TChatRoom) => {
    setOpen(false);
    setActiveRoom(room);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <IconBadgeButton icon={<MessageCircleIcon aria-hidden />} label="Tin nhắn" count={data?.totalUnread ?? 0} />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))] gap-0 p-0">
          <h2 className="border-b border-border-subtle px-3 py-2 text-sm font-semibold">Tin nhắn</h2>
          <div className="scrollbar-thin max-h-96 overflow-y-auto p-1">
            {query.isPending ? (
              <ul className="flex flex-col gap-1 p-1" aria-busy aria-label="Đang tải tin nhắn">
                {Array.from({ length: SKELETON_ROWS }, (_, index) => (
                  <li key={index} className="flex items-center gap-3 px-1 py-2">
                    <div className="size-10 shrink-0 animate-pulse rounded-full bg-muted" />
                    <div className="flex flex-1 flex-col gap-1.5">
                      <div className="h-3.5 w-1/2 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                    </div>
                  </li>
                ))}
              </ul>
            ) : !data ? (
              <div role="alert" className="flex flex-col items-center gap-2 px-3 py-6 text-center text-sm text-muted-foreground">
                Không tải được danh sách tin nhắn.
                <Button variant="outline" size="sm" onClick={() => query.refetch()}>
                  Thử lại
                </Button>
              </div>
            ) : data.rooms.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                Chưa có cuộc trò chuyện nào. Mở trang nhà phân phối để bắt đầu chat.
              </p>
            ) : (
              <ul className="flex flex-col gap-0.5">
                {data.rooms.map((room) => (
                  <li key={room.roomId}>
                    <ChatRoomItem room={room} currentUserId={currentUserId} onSelect={handleSelect} />
                  </li>
                ))}
                {query.hasNextPage && (
                  <li className="flex justify-center py-1">
                    <Button variant="ghost" size="sm" loading={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>
                      {query.isFetchNextPageError ? "Tải thêm thất bại — thử lại" : "Xem thêm"}
                    </Button>
                  </li>
                )}
              </ul>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {activeRoom && currentUserId && (
        <ChatModal
          key={activeRoom.roomId}
          open
          onOpenChange={(next) => !next && setActiveRoom(null)}
          target={{ roomId: activeRoom.roomId }}
          otherUsername={activeRoom.otherUsername}
          currentUserId={currentUserId}
        />
      )}
    </>
  );
}
