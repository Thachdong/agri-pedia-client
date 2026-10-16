import { ChevronRightIcon, SproutIcon, TreeDeciduousIcon, WheatIcon, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/shared/constants";
import { cn } from "@/shared/lib/utils";
import type { TArticleCrop } from "../types/article.types";

/** Icon theo cây (cùng bộ với nút chẩn đoán) — cây mới chưa có icon riêng dùng mầm cây. */
const CROP_ICONS: Record<string, LucideIcon> = {
  RICE: WheatIcon,
  DURIAN: TreeDeciduousIcon,
};

export type TArticleCropCardProps = {
  crop: TArticleCrop;
  className?: string;
};

/** Thẻ 1 cây ở /benh-cay-trong: icon, tên, số bài → danh sách bài của cây. */
export function ArticleCropCard({ crop, className }: TArticleCropCardProps) {
  const Icon = CROP_ICONS[crop.code] ?? SproutIcon;
  return (
    <Link
      href={ROUTES.articles.crop(crop.slug)}
      className={cn(
        "card-normal flex items-center gap-4 rounded-lg p-4 outline-none transition-colors hover:border-primary focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-success-subtle text-success">
        <Icon className="size-6" aria-hidden />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-semibold text-foreground">{crop.nameVi}</span>
        <span className="text-sm text-muted-foreground">{crop.articleCount} bài viết</span>
      </span>
      <ChevronRightIcon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
    </Link>
  );
}
