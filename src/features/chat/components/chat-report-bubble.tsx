import { ChevronRightIcon, ClipboardListIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { CHAT_REPORT_LABEL } from "../constants/chat.constants";
import type { TChatMessage } from "../types/chat.types";
import { CHAT_FULL_TIME_FORMAT, CHAT_TIME_FORMAT, chatBubbleVariants, chatRowVariants } from "./chat-message-bubble";

const LABEL_PREFIX = `${CHAT_REPORT_LABEL} · `;

export type TChatReportBubbleProps = Omit<React.ComponentProps<"li">, "children"> & {
  /** Tin DIAGNOSIS_REPORT. */
  message: TChatMessage;
  mine: boolean;
  onOpen: (messageId: string) => void;
};

/**
 * Tin report chẩn đoán: nhãn + "cây · thời gian chẩn đoán" (text tạo lúc gửi, xem formatReportMessage) + giờ gửi.
 * Cả bong bóng là nút mở dialog report.
 */
export function ChatReportBubble({ message, mine, onOpen, className, ...props }: TChatReportBubbleProps) {
  const sentAt = new Date(message.createdAt);
  // Text không theo mẫu (client cũ / gửi tay) → hiện nguyên văn dưới nhãn.
  const detail = message.message.startsWith(LABEL_PREFIX) ? message.message.slice(LABEL_PREFIX.length) : message.message;

  return (
    <li className={cn(chatRowVariants({ mine }), className)} {...props}>
      <button
        type="button"
        onClick={() => onOpen(message.id)}
        className={cn(
          chatBubbleVariants({ mine }),
          "group min-w-56 gap-1 text-left outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        <span className="sr-only">{mine ? "Bạn:" : "Họ:"}</span>
        <span className="flex items-center gap-2 font-semibold">
          <ClipboardListIcon className="size-4 shrink-0" aria-hidden />
          {CHAT_REPORT_LABEL}
        </span>
        <span className={mine ? "text-primary-foreground/90" : "text-muted-foreground"}>{detail}</span>
        <span className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-0.5 text-xs font-medium underline-offset-2 group-hover:underline">
            Xem báo cáo
            <ChevronRightIcon className="size-3.5" aria-hidden />
          </span>
          <time
            dateTime={message.createdAt}
            title={CHAT_FULL_TIME_FORMAT.format(sentAt)}
            className={cn("text-[0.625rem]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}
          >
            {CHAT_TIME_FORMAT.format(sentAt)}
          </time>
        </span>
      </button>
    </li>
  );
}
