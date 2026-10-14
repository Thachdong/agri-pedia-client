import { cn } from "@/shared/lib/utils";

export type TCountBadgeProps = Omit<React.ComponentProps<"span">, "children"> & {
  count: number;
  /** Quá mức này hiện `<max>+`. */
  max?: number;
  /** `count` chỉ là cận dưới (vd. mới đếm trên trang đã tải) → hiện `<count>+`. */
  atLeast?: boolean;
};

export const formatCount = (count: number, max: number, atLeast: boolean) =>
  count > max ? `${max}+` : atLeast ? `${count}+` : String(count);

/**
 * Chấm số đếm (unread...). `count <= 0` → không render.
 * aria-hidden: số đã được đọc qua aria-label của control chứa nó.
 */
export function CountBadge({ count, max = 99, atLeast = false, className, ...props }: TCountBadgeProps) {
  if (count <= 0) return null;
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-highlight px-1 text-[0.625rem] leading-none font-semibold text-highlight-foreground tabular-nums ring-2 ring-background",
        className,
      )}
      {...props}
    >
      {formatCount(count, max, atLeast)}
    </span>
  );
}
