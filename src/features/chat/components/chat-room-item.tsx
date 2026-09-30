import { Avatar, CountBadge } from "@/shared/components/atoms";
import { cn } from "@/shared/lib/utils";
import { formatRelativeTime } from "@/shared/utils";
import { CHAT_UNKNOWN_USER_NAME } from "../constants/chat.constants";
import type { TChatRoom } from "../types/chat.types";

export type TChatRoomItemProps = Omit<React.ComponentProps<"button">, "children" | "onSelect"> & {
  room: TChatRoom;
  /** Người đang đăng nhập — tin cuối của mình hiện "Bạn: ...". */
  currentUserId: string;
  onSelect?: (room: TChatRoom) => void;
};

/** Một room trong danh sách chat: avatar, tên, tin cuối, thời gian, số chưa đọc. */
export function ChatRoomItem({ room, currentUserId, onSelect, className, ...props }: TChatRoomItemProps) {
  const { otherUsername, lastMessage, lastMessageAt, unreadCount } = room;
  const name = otherUsername ?? CHAT_UNKNOWN_USER_NAME;
  const unread = unreadCount > 0;
  const preview = lastMessage
    ? `${lastMessage.senderId === currentUserId ? "Bạn: " : ""}${lastMessage.message}`
    : "Chưa có tin nhắn";

  return (
    <button
      type="button"
      onClick={() => onSelect?.(room)}
      aria-label={unread ? `${name}, ${unreadCount} tin chưa đọc` : name}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    >
      {/* otherUserAvatar là media id, chưa có endpoint đổi sang URL → chữ cái đầu. */}
      <Avatar name={name} size="lg" />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-baseline justify-between gap-2">
          <span className={cn("truncate text-sm", unread && "font-semibold")}>{name}</span>
          <time dateTime={lastMessageAt} className="shrink-0 text-xs text-muted-foreground">
            {formatRelativeTime(lastMessageAt)}
          </time>
        </span>
        <span className="flex items-center justify-between gap-2">
          <span className={cn("truncate text-xs", unread ? "text-foreground" : "text-muted-foreground")}>{preview}</span>
          <CountBadge count={unreadCount} className="shrink-0 ring-0" />
        </span>
      </span>
    </button>
  );
}
