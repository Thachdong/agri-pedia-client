"use client";

import { FileSearchIcon, RefreshCwIcon } from "lucide-react";
import { useState } from "react";
import { Button, Tabs, TabsList, TabsTrigger } from "@/shared/components/atoms";
import { Callout } from "@/shared/components/molecules";
import { cn } from "@/shared/lib/utils";
import { ARTICLE_CATEGORY_TABS, type TArticleCategoryTab } from "../constants/article.constants";
import { useArticleList } from "../hooks/use-article-list";
import type { TArticleListResponse } from "../types/article.types";
import { ArticleCard } from "./article-card";

/** Số thẻ đầu tải ảnh ưu tiên (hàng đầu của lưới 3 cột). */
const PRIORITY_CARDS = 3;
const SKELETON_CARDS = 6;

export type TArticleListProps = {
  cropSlug: string;
  /** Trang đầu (không lọc) đã render ở server — SEO thấy đủ bài mà không cần JS. */
  initialPage: TArticleListResponse;
  className?: string;
};

function isCategoryTab(value: string): value is TArticleCategoryTab {
  return ARTICLE_CATEGORY_TABS.some((tab) => tab.value === value);
}

/**
 * Lưới bài của 1 cây: tab Bệnh / Sâu hại / Rối loạn (state client — đọc `searchParams` sẽ làm route mất ISR),
 * "Xem thêm" tải trang tiếp theo qua BFF. Đổi tab → tải trang đầu của tab đó (skeleton).
 */
export function ArticleList({ cropSlug, initialPage, className }: TArticleListProps) {
  const [tab, setTab] = useState<TArticleCategoryTab>("all");
  const category = tab === "all" ? undefined : tab;
  const query = useArticleList({ crop: cropSlug, category }, category ? undefined : initialPage);
  const articles = query.data?.pages.flatMap((page) => page.articles) ?? [];

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <Tabs value={tab} onValueChange={(value) => isCategoryTab(value) && setTab(value)}>
        <TabsList aria-label="Lọc theo nhóm">
          {ARTICLE_CATEGORY_TABS.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {query.isPending ? (
        <ul aria-busy className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: SKELETON_CARDS }, (_, index) => (
            <li key={index} className="card-normal overflow-hidden rounded-lg">
              <div className="aspect-video animate-pulse bg-muted" />
              <div className="flex flex-col gap-2 p-4">
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-full animate-pulse rounded bg-muted" />
                <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
              </div>
            </li>
          ))}
        </ul>
      ) : query.isError ? (
        <Callout
          tone="danger"
          title="Không tải được danh sách bài viết"
          action={
            <Button size="sm" variant="outline" onClick={() => void query.refetch()}>
              <RefreshCwIcon aria-hidden />
              Thử lại
            </Button>
          }
        >
          {query.error.message}
        </Callout>
      ) : articles.length === 0 ? (
        <Callout tone="neutral" icon={FileSearchIcon} title="Chưa có bài viết">
          Nhóm này chưa có bài viết nào cho cây trồng này.
        </Callout>
      ) : (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, index) => (
              <li key={article.path}>
                <ArticleCard article={article} priority={index < PRIORITY_CARDS} className="h-full" />
              </li>
            ))}
          </ul>
          {query.hasNextPage && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                loading={query.isFetchingNextPage}
                onClick={() => void query.fetchNextPage()}
              >
                Xem thêm
              </Button>
            </div>
          )}
          {query.isFetchNextPageError && (
            <p role="alert" className="text-center text-sm text-destructive">
              Không tải thêm được bài viết, vui lòng thử lại.
            </p>
          )}
        </>
      )}
    </div>
  );
}
