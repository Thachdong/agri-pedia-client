import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

const badgeVariants = cva(
  "inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap [&>svg]:size-3",
  {
    variants: {
      tone: {
        neutral: "border-border-subtle bg-surface text-surface-foreground",
        success: "border-transparent bg-success-subtle text-success",
        warning: "border-transparent bg-warning-subtle text-warning",
        info: "border-transparent bg-info-subtle text-info",
        danger: "border-transparent bg-destructive/10 text-destructive",
        highlight: "border-transparent bg-highlight-subtle text-highlight",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export type TBadgeTone = NonNullable<VariantProps<typeof badgeVariants>["tone"]>;

export type TBadgeProps = React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

/** Nhãn trạng thái ngắn (mức tin cậy, trạng thái xử lý...) — màu theo `tone`. */
export function Badge({ className, tone, ...props }: TBadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
