"use client";

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useDiagnosisHistory } from "@/features/diagnosis";
import { Button } from "@/shared/components/atoms";
import { ScrollCarousel } from "@/shared/components/molecules";
import { ROUTES } from "@/shared/constants";
import { useAppQueries, useAppQuery } from "@/shared/lib/query";
import { cn } from "@/shared/lib/utils";
import { RELATED_ARTICLES_MAX_CROPS, RELATED_ARTICLES_PER_CROP } from "../constants/article.constants";
import { articleCropsQuery, cropArticleIndexQuery } from "../hooks/article.queries";
import type { TArticleCrop, TArticleListItem, TTopArticlesGroup } from "../types/article.types";
import { ArticleCard } from "./article-card";
import { TopArticlesSection } from "./top-articles-section";

export type TDiagnosisRelatedArticlesProps = {
  /** Bài nổi bật (GET /knowledge/articles/top, page lấy ở server) — dùng khi chưa có bệnh nào để gợi ý. */
  topArticles: TTopArticlesGroup[];
  className?: string;
};

type TRelatedGroup = { crop: TArticleCrop; articles: TArticleListItem[] };

/** Khai báo ngoài component → react-query giữ nguyên kết quả khi dữ liệu các query không đổi. */
const combineIndexes = (results: { data?: TArticleListItem[]; isPending: boolean }[]) => ({
  data: results.map((query) => query.data),
  pending: results.some((query) => query.isPending),
});

/**
 * Bài viết liên quan ở /diagnosis (Specs/19102026): có chẩn đoán phát hiện bệnh → bài của các bệnh đó (theo lần chẩn
 * đoán gần nhất, mỗi cây 1 khối); chưa có chẩn đoán / chưa phát hiện bệnh / bệnh chưa có bài → bài nổi bật (như
 * trang chủ). Chỉ xét các trang lịch sử đã tải; API chưa lọc bài theo diseaseCode nên tải hết bài của cây rồi lọc.
 */
export function DiagnosisRelatedArticles({ topArticles, className }: TDiagnosisRelatedArticlesProps) {
  const history = useDiagnosisHistory();
  const crops = useAppQuery({ ...articleCropsQuery(), meta: { silent: true } });

  // cropType → diseaseCode theo thứ tự lần chẩn đoán gần nhất (lịch sử mới nhất trước), không trùng.
  const codesByCrop = useMemo(() => {
    const result = new Map<string, string[]>();
    for (const diagnosis of history.data ?? []) {
      for (const { diseaseCode } of diagnosis.diseases) {
        const codes = result.get(diagnosis.cropType) ?? [];
        if (!codes.includes(diseaseCode)) result.set(diagnosis.cropType, [...codes, diseaseCode]);
      }
    }
    return result;
  }, [history.data]);

  const targets = useMemo(
    () =>
      [...codesByCrop.entries()]
        .flatMap(([cropType, codes]) => {
          const crop = crops.data?.crops.find((item) => item.code === cropType);
          return crop ? [{ crop, codes }] : [];
        })
        .slice(0, RELATED_ARTICLES_MAX_CROPS),
    [codesByCrop, crops.data],
  );

  const indexes = useAppQueries({
    queries: targets.map(({ crop }) => ({ ...cropArticleIndexQuery(crop.slug), meta: { silent: true } })),
    combine: combineIndexes,
  });

  const groups = useMemo<TRelatedGroup[]>(
    () =>
      targets.flatMap(({ crop, codes }, index) => {
        const articles = indexes.data[index] ?? [];
        // Bài chính của bệnh (không lấy bài variant), theo thứ tự bệnh trong lịch sử.
        const byCode = new Map(
          articles.flatMap((item) => (item.disease && !item.variant ? [[item.disease.code, item] as const] : [])),
        );
        const matched = codes.flatMap((code) => byCode.get(code) ?? []).slice(0, RELATED_ARTICLES_PER_CROP);
        return matched.length > 0 ? [{ crop, articles: matched }] : [];
      }),
    [targets, indexes.data],
  );

  const loading = history.isPending || (codesByCrop.size > 0 && (crops.isPending || indexes.pending));
  if (loading) return <RelatedSkeleton className={className} />;

  // Không có bệnh / bệnh chưa có bài / tải lỗi → bài nổi bật.
  if (groups.length === 0) return <TopArticlesSection groups={topArticles} className={className} />;

  return (
    <section aria-labelledby="related-articles-title" className={cn("flex flex-col gap-6", className)}>
      <header className="flex flex-col gap-1">
        <h2 id="related-articles-title" className="text-lg font-semibold sm:text-xl">
          Bài viết liên quan
        </h2>
        <p className="text-sm text-muted-foreground">Về các bệnh phát hiện trong những lần chẩn đoán gần đây.</p>
      </header>
      {groups.map(({ crop, articles }) => {
        const headingId = `related-articles-${crop.slug}`;
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
            <ScrollCarousel aria-label={`Bài viết liên quan về ${crop.nameVi}`} itemClassName="w-72">
              {articles.map((article) => (
                <ArticleCard key={article.path} article={article} titleAs="h4" className="h-full" />
              ))}
            </ScrollCarousel>
          </section>
        );
      })}
    </section>
  );
}

function RelatedSkeleton({ className }: { className?: string }) {
  return (
    <div aria-busy aria-label="Đang tải bài viết liên quan" className={cn("flex flex-col gap-3", className)}>
      <div className="h-6 w-48 animate-pulse rounded bg-muted" />
      <div className="flex gap-4 overflow-hidden">
        {[0, 1, 2].map((index) => (
          <div key={index} className="aspect-video w-72 shrink-0 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}
