import { cva } from "class-variance-authority";
import { BugIcon, ImageIcon, LeafIcon, SproutIcon, type LucideIcon } from "lucide-react";
import { CATEGORY_LABELS } from "@/features/diagnosis";
import { cn } from "@/shared/lib/utils";
import type { TArticleCategory } from "../types/article.types";

const placeholderVariants = cva("flex flex-col items-center justify-center gap-2 overflow-hidden", {
  variants: {
    tone: {
      DISEASE: "bg-success-subtle text-success",
      PEST: "bg-warning-subtle text-warning",
      DISORDER: "bg-info-subtle text-info",
      none: "bg-surface text-muted-foreground",
    },
    size: {
      sm: "[&_svg]:size-6 text-xs",
      md: "[&_svg]:size-10 text-sm",
      lg: "[&_svg]:size-14 text-base",
    },
  },
  defaultVariants: { tone: "none", size: "md" },
});

const CATEGORY_ICONS: Record<TArticleCategory, LucideIcon> = {
  DISEASE: LeafIcon,
  PEST: BugIcon,
  DISORDER: SproutIcon,
};

export type TCategoryPlaceholderProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** null = bài không gắn bệnh → khung trung tính. */
  category: TArticleCategory | null;
  size?: "sm" | "md" | "lg";
  /** Hiện nhãn nhóm dưới icon (tắt ở thumbnail nhỏ). */
  showLabel?: boolean;
};

/**
 * Thay ảnh cover khi bài / bệnh không có ảnh: icon + màu theo nhóm (Bệnh / Sâu hại / Rối loạn).
 * Trang trí thuần — ẩn với screen reader; kích thước / tỉ lệ do nơi dùng quyết định qua `className`.
 */
export function CategoryPlaceholder({
  category,
  size,
  showLabel = true,
  className,
  ...props
}: TCategoryPlaceholderProps) {
  const Icon = category ? CATEGORY_ICONS[category] : ImageIcon;
  return (
    <div aria-hidden className={cn(placeholderVariants({ tone: category ?? "none", size }), className)} {...props}>
      <Icon />
      {showLabel && category && <span className="font-medium">{CATEGORY_LABELS[category]}</span>}
    </div>
  );
}
