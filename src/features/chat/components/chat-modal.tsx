"use client";

import { SendIcon } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Textarea,
} from "@/shared/components/atoms";
import { applyServerErrors, useAppForm } from "@/shared/lib/form";
import { useRealtime } from "@/shared/lib/realtime";
import { cn } from "@/shared/lib/utils";
import { CHAT_UNKNOWN_USER_NAME } from "../constants/chat.constants";
import { useRoomMessages } from "../hooks/use-room-messages";
import { useRoomPresence } from "../hooks/use-room-presence";
import { useSendMessage } from "../hooks/use-send-message";
import { chatMessageSchema } from "../schemas/chat-message.schema";
import type { TChatMessageFormValues } from "../types/chat.types";
import { ChatMessageBubble } from "./chat-message-bubble";

/** Room đã có → `roomId`; chat lần đầu với ai đó (vd. từ trang profile) → `receiverId`. */
export type TChatTarget = { roomId: string; receiverId?: never } | { roomId?: never; receiverId: string };

export type TChatModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: TChatTarget;
  /** Tên người bên kia (null → "Người dùng"). */
  otherUsername?: string | null;
  /** Người đang đăng nhập (useMe). */
  currentUserId: string;
};

/** Cách đáy dưới mức này (px) coi như đang ở cuối → tin mới tự cuộn xuống. */
const NEAR_BOTTOM_PX = 80;

/**
 * Chat modal (ui-ux.md §7 M2): tin nhắn của room (cuộn lên tải tin cũ), gửi qua socket.
 * Chưa có room → khung trống, tin đầu gửi bằng receiverId, ack trả roomId → chuyển sang room đó.
 * Cần nằm trong RealtimeProvider.
 */
export function ChatModal({ open, onOpenChange, target, otherUsername, currentUserId }: TChatModalProps) {
  const name = otherUsername ?? CHAT_UNKNOWN_USER_NAME;
  // Room tạo ra khi gửi tin đầu bằng receiverId.
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const roomId = target.roomId ?? createdRoomId;

  const { status } = useRealtime();
  useRoomPresence(roomId, open);
  const messages = useRoomMessages(open ? roomId : null);
  const send = useSendMessage(currentUserId);
  const form = useAppForm<TChatMessageFormValues>({ schema: chatMessageSchema, defaultValues: { message: "" } });

  const onSubmit = form.handleSubmit(async ({ message }) => {
    try {
      const ack = await send.mutateAsync(roomId ? { roomId, message } : { receiverId: target.receiverId, message });
      if (!roomId) setCreatedRoomId(ack.roomId);
      form.reset({ message: "" });
    } catch (error) {
      applyServerErrors(form, error);
    }
  });

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter gửi, Shift+Enter xuống dòng; bỏ qua khi bộ gõ (Telex/VNI) đang ghép chữ.
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void onSubmit();
    }
  };

  const fieldError = form.formState.errors.message?.message;
  const rootError = form.formState.errors.root?.server?.message;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(36rem,90dvh)] flex-col gap-0 p-0 sm:max-w-md">
        <DialogHeader className="border-b border-border-subtle px-4 py-3">
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription className={cn(status === "connected" && "sr-only")}>
            {status === "connected" ? `Trò chuyện với ${name}` : "Đang kết nối máy chủ chat…"}
          </DialogDescription>
        </DialogHeader>

        <MessageList roomId={roomId} messages={messages} currentUserId={currentUserId} />

        <form onSubmit={onSubmit} className="flex flex-col gap-1 border-t border-border-subtle p-3" noValidate>
          <div className="flex items-end gap-2">
            <Textarea
              {...form.register("message")}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Nhập tin nhắn…"
              aria-label="Tin nhắn"
              aria-invalid={Boolean(fieldError) || undefined}
              className="max-h-32 min-h-9 resize-none"
            />
            <Button type="submit" size="icon" loading={send.isPending} aria-label="Gửi">
              {!send.isPending && <SendIcon aria-hidden />}
            </Button>
          </div>
          {(fieldError || rootError) && (
            <p role="alert" className="text-xs text-destructive">
              {fieldError ?? rootError}
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}

type TMessageListProps = {
  roomId: string | null;
  messages: ReturnType<typeof useRoomMessages>;
  currentUserId: string;
};

function MessageList({ roomId, messages, currentUserId }: TMessageListProps) {
  const { data, hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage } = messages;
  const containerRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLLIElement>(null);
  const layout = useRef({ firstId: undefined as string | undefined, lastId: undefined as string | undefined, height: 0 });

  // Giữ vị trí khi chèn tin cũ lên đầu; tự cuộn xuống khi có tin mới (của mình, hoặc đang ở gần cuối).
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || !data) return;
    const previous = layout.current;
    const firstId = data[0]?.id;
    const last = data.at(-1);
    const nearBottom = container.scrollHeight - previous.height - container.scrollTop < NEAR_BOTTOM_PX;

    if (previous.lastId === undefined || (last?.id !== previous.lastId && (nearBottom || last?.senderId === currentUserId))) {
      container.scrollTop = container.scrollHeight;
    } else if (firstId !== previous.firstId && last?.id === previous.lastId) {
      container.scrollTop += container.scrollHeight - previous.height;
    }
    layout.current = { firstId, lastId: last?.id, height: container.scrollHeight };
  }, [data, currentUserId]);

  // Sentinel đầu danh sách lọt vào khung → tải tin cũ hơn.
  const canLoadOlder = hasNextPage && !isFetchingNextPage && !isFetchNextPageError;
  useEffect(() => {
    const sentinel = topSentinelRef.current;
    if (!sentinel || !canLoadOlder) return;
    const observer = new IntersectionObserver(([entry]) => entry?.isIntersecting && fetchNextPage(), {
      root: containerRef.current,
      rootMargin: "120px 0px 0px 0px",
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [canLoadOlder, fetchNextPage]);

  const hint = (text: React.ReactNode) => (
    <div className="flex flex-1 items-center justify-center px-4 text-center text-sm text-muted-foreground">{text}</div>
  );

  if (!roomId) return hint("Chưa có tin nhắn. Hãy gửi lời chào đầu tiên!");
  if (messages.isPending) {
    return (
      <div className="flex flex-1 flex-col justify-end gap-2 p-4" aria-busy aria-label="Đang tải tin nhắn">
        {["w-2/3", "ml-auto w-1/2", "w-3/5"].map((width) => (
          <div key={width} className={cn("h-9 animate-pulse rounded-2xl bg-muted", width)} />
        ))}
      </div>
    );
  }
  if (!data) {
    return hint(
      <span role="alert" className="flex flex-col items-center gap-2">
        Không tải được tin nhắn.
        <Button variant="outline" size="sm" onClick={() => messages.refetch()}>
          Thử lại
        </Button>
      </span>,
    );
  }
  if (data.length === 0) return hint("Chưa có tin nhắn. Hãy gửi lời chào đầu tiên!");

  return (
    <div ref={containerRef} className="scrollbar-thin flex-1 overflow-y-auto px-4 py-3">
      <ul className="flex flex-col gap-1.5" aria-live="polite" aria-relevant="additions">
        <li ref={topSentinelRef} className="flex justify-center text-xs text-muted-foreground">
          {isFetchingNextPage && "Đang tải tin cũ hơn…"}
          {isFetchNextPageError && (
            <Button variant="ghost" size="sm" onClick={() => fetchNextPage()}>
              Tải tin cũ thất bại — thử lại
            </Button>
          )}
        </li>
        {data.map((message) => (
          <ChatMessageBubble key={message.id} message={message} mine={message.senderId === currentUserId} />
        ))}
      </ul>
    </div>
  );
}
