import { BellIcon, StarIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { formatRelativeTime } from "@/shared/utils";
import type { TNotification } from "../types/notification.types";

const TYPE_ICONS: Record<TNotification["type"], typeof BellIcon> = {
  PLATFORM: BellIcon,
  REVIEW: StarIcon,
};

export type TNotificationItemProps = Omit<React.ComponentProps<"button">, "children" | "onSelect"> & {
  notification: TNotification;
  onSelect?: (notification: TNotification) => void;
};

/** Một dòng thông báo: icon theo type, label, nội dung, thời gian tương đối; chưa đọc → nền nhấn + chấm. */
export function NotificationItem({ notification, onSelect, className, ...props }: TNotificationItemProps) {
  const { type, label, content, isRead, createdAt } = notification;
  const Icon = TYPE_ICONS[type];

  return (
    <button
      type="button"
      onClick={() => onSelect?.(notification)}
      className={cn(
        "flex w-full items-start gap-3 rounded-md px-2 py-2 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
        !isRead && "bg-highlight-subtle hover:bg-highlight-subtle/70",
        className,
      )}
      {...props}
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", isRead ? "text-muted-foreground" : "text-highlight")} aria-hidden />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={cn("truncate text-sm", !isRead && "font-semibold")}>{label}</span>
        <span className="line-clamp-2 text-xs text-muted-foreground">{content}</span>
        <time dateTime={createdAt} className="text-xs text-muted-foreground">
          {formatRelativeTime(createdAt)}
        </time>
      </span>
      {!isRead && (
        <>
          <span className="mt-1.5 size-2 shrink-0 rounded-full bg-highlight" aria-hidden />
          <span className="sr-only">Chưa đọc</span>
        </>
      )}
    </button>
  );
}
