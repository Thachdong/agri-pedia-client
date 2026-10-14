import { cva } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";
import type { TChatMessage } from "../types/chat.types";

const TIME_FORMAT = new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" });
const FULL_FORMAT = new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" });

const rowVariants = cva("flex w-full", {
  variants: { mine: { true: "justify-end", false: "justify-start" } },
});

const bubbleVariants = cva(
  "flex max-w-[80%] flex-col gap-0.5 rounded-2xl px-3 py-2 text-sm break-words whitespace-pre-wrap",
  {
    variants: {
      mine: {
        true: "rounded-br-sm bg-primary text-primary-foreground",
        false: "card-normal rounded-bl-sm",
      },
    },
  },
);

export type TChatMessageBubbleProps = Omit<React.ComponentProps<"li">, "children"> & {
  message: TChatMessage;
  /** Tin của người đang đăng nhập → bên phải, màu primary. */
  mine: boolean;
};

/** Một tin nhắn: nội dung (giữ xuống dòng) + giờ gửi; hover giờ → ngày giờ đầy đủ. */
export function ChatMessageBubble({ message, mine, className, ...props }: TChatMessageBubbleProps) {
  const sentAt = new Date(message.createdAt);

  return (
    <li className={cn(rowVariants({ mine }), className)} {...props}>
      <div className={bubbleVariants({ mine })}>
        <span className="sr-only">{mine ? "Bạn:" : "Họ:"}</span>
        <p>{message.message}</p>
        <time
          dateTime={message.createdAt}
          title={FULL_FORMAT.format(sentAt)}
          className={cn("self-end text-[0.625rem]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}
        >
          {TIME_FORMAT.format(sentAt)}
        </time>
      </div>
    </li>
  );
}
