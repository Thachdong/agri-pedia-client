import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/components/atoms";
import { ROUTES } from "@/shared/constants";
import { cn } from "@/shared/lib/utils";
import type { TTopArticlesGroup } from "../types/article.types";
import { ArticleCard } from "./article-card";

export type TTopArticlesSectionProps = {
  /** GET /knowledge/articles/top `crops` — mỗi cây một khối, theo thứ tự server. */
  groups: TTopArticlesGroup[];
  className?: string;
};

/**
 * Bài viết nổi bật ở trang chủ: mỗi cây một khối — tên cây + "Xem thêm" (danh sách bài của cây) + hàng thẻ bài
 * cuộn ngang. Không có cây nào → không render.
 */
export function TopArticlesSection({ groups, className }: TTopArticlesSectionProps) {
  if (groups.length === 0) return null;

  return (
    <section aria-labelledby="top-articles-title" className={cn("flex flex-col gap-6", className)}>
      <h2 id="top-articles-title" className="text-lg font-semibold sm:text-xl">
        Bài viết nổi bật
      </h2>
      {groups.map(({ crop, articles }) => {
        const headingId = `top-articles-${crop.slug}`;
        return (
          <section key={crop.code} aria-labelledby={headingId} className="flex flex-col gap-3">
            <header className="flex items-center justify-between gap-3">
              <h3 id={headingId} className="font-semibold text-primary">
                {crop.nameVi}
              </h3>
              <Button asChild variant="ghost" size="sm">
                <Link href={ROUTES.articles.crop(crop.slug)} aria-label={`Xem thêm bài viết về ${crop.nameVi}`}>
                  Xem thêm
                  <ArrowRightIcon aria-hidden />
                </Link>
              </Button>
            </header>
            <ul className="scrollbar-thin flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
              {articles.map((article) => (
                <li key={article.path} className="w-72 shrink-0 snap-start">
                  <ArticleCard article={article} titleAs="h4" className="h-full" />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </section>
  );
}
