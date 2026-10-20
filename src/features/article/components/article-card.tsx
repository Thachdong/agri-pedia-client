import Image from "next/image";
import Link from "next/link";
import { CATEGORY_LABELS } from "@/features/diagnosis";
import { Badge } from "@/shared/components/atoms";
import { cn } from "@/shared/lib/utils";
import type { TArticleListItem } from "../types/article.types";
import { CategoryPlaceholder } from "./category-placeholder";

export type TArticleCardProps = {
  article: TArticleListItem;
  /** Ảnh của vài thẻ đầu (trong màn hình đầu) tải ưu tiên — tránh LCP chậm. */
  priority?: boolean;
  className?: string;
};

/** Thẻ bài trong lưới danh sách: ảnh cover (hoặc placeholder theo nhóm), tiêu đề, tên khoa học, tóm tắt 2 dòng. */
export function ArticleCard({ article, priority = false, className }: TArticleCardProps) {
  const category = article.disease?.category ?? null;
  return (
    <Link
      href={article.path}
      className={cn(
        "card-normal group flex flex-col overflow-hidden rounded-lg outline-none transition-colors hover:border-primary focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <div className="relative aspect-video w-full bg-surface">
        {article.coverUrl ? (
          <Image
            src={article.coverUrl}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1024px) 22rem, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <CategoryPlaceholder category={category} className="size-full" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {/* Không hiện trạng thái DRAFT trên thẻ — trang bài vẫn noindex bài DRAFT. */}
        {category && (
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge>{CATEGORY_LABELS[category]}</Badge>
          </div>
        )}
        <h2 className="font-semibold text-foreground group-hover:text-primary">{article.title}</h2>
        {article.disease?.scientificName && (
          <p className="text-sm text-muted-foreground italic">{article.disease.scientificName}</p>
        )}
        <p className="line-clamp-2 text-sm text-muted-foreground">{article.summary}</p>
      </div>
    </Link>
  );
}
