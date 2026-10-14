import { Button, CountBadge, formatCount, type TButtonProps } from "@/shared/components/atoms";
import { cn } from "@/shared/lib/utils";

export type TIconBadgeButtonProps = Omit<TButtonProps, "children" | "aria-label" | "size" | "asChild"> & {
  icon: React.ReactNode;
  /** Tên nút cho trình đọc màn hình (vd. "Thông báo"). */
  label: string;
  count?: number;
  countMax?: number;
  /** `count` là cận dưới → `N+`. */
  countAtLeast?: boolean;
};

/**
 * Nút icon kèm chấm số đếm (header: thông báo, chat). aria-label gộp cả số mới.
 * Nhận mọi prop của Button (kể cả `ref`) → dùng được làm `PopoverTrigger asChild`.
 */
export function IconBadgeButton({
  icon,
  label,
  count = 0,
  countMax = 99,
  countAtLeast = false,
  variant = "ghost",
  className,
  ...props
}: TIconBadgeButtonProps) {
  const ariaLabel = count > 0 ? `${label}, ${formatCount(count, countMax, countAtLeast)} mới` : label;

  return (
    <Button variant={variant} size="icon" aria-label={ariaLabel} className={cn("relative", className)} {...props}>
      {icon}
      <CountBadge count={count} max={countMax} atLeast={countAtLeast} className="absolute -top-1 -right-1" />
    </Button>
  );
}
