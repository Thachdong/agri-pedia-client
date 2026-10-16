import { cva, type VariantProps } from "class-variance-authority";
import { CircleAlertIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon, type LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const calloutVariants = cva("flex gap-3 rounded-lg border px-4 py-3 text-sm", {
  variants: {
    tone: {
      neutral: "border-border-subtle bg-surface text-surface-foreground",
      info: "border-info/30 bg-info-subtle text-foreground [&_[data-slot=callout-icon]]:text-info",
      success: "border-success/30 bg-success-subtle text-foreground [&_[data-slot=callout-icon]]:text-success",
      warning: "border-warning/30 bg-warning-subtle text-foreground [&_[data-slot=callout-icon]]:text-warning",
      danger: "border-destructive/30 bg-destructive/10 text-foreground [&_[data-slot=callout-icon]]:text-destructive",
    },
  },
  defaultVariants: { tone: "info" },
});

type TCalloutTone = NonNullable<VariantProps<typeof calloutVariants>["tone"]>;

const DEFAULT_ICONS: Record<TCalloutTone, LucideIcon> = {
  neutral: InfoIcon,
  info: InfoIcon,
  success: CircleCheckIcon,
  warning: TriangleAlertIcon,
  danger: CircleAlertIcon,
};

export type TCalloutProps = Omit<React.ComponentProps<"div">, "title"> &
  VariantProps<typeof calloutVariants> & {
    title?: React.ReactNode;
    /** Icon thay cho icon mặc định của tone; `null` = không icon. */
    icon?: LucideIcon | null;
    /** Nút / link hành động bên dưới nội dung. */
    action?: React.ReactNode;
  };

/**
 * Khối thông báo trong trang (mẹo, cảnh báo, lỗi chung của form...). Không tự là live region —
 * truyền `role="alert"` khi nội dung xuất hiện do thao tác của người dùng (vd. lỗi gửi form).
 */
export function Callout({ tone, title, icon, action, className, children, ...props }: TCalloutProps) {
  const Icon = icon === undefined ? DEFAULT_ICONS[tone ?? "info"] : icon;
  return (
    <div className={cn(calloutVariants({ tone }), className)} {...props}>
      {Icon && <Icon data-slot="callout-icon" aria-hidden className="mt-0.5 size-4 shrink-0" />}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className="text-muted-foreground">{children}</div>}
        {action && <div className="mt-1 flex flex-wrap gap-2">{action}</div>}
      </div>
    </div>
  );
}
