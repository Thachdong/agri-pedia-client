import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ArticleDetail, articleFetchOptions, articleJsonLd, getArticle } from "@/features/article";
import { publicEnv } from "@/shared/config";
import { isAppError } from "@/shared/lib/http";
import { publicServerHttp } from "@/shared/lib/http/public-server";

/** ISR: render lần đầu khi có người mở, cache 30 ngày (= ARTICLE_REVALIDATE_SECONDS; phải là literal) — đổi bài đến qua revalidateTag. */
export const revalidate = 2592000;

/** Không prerender lúc build; mọi bài render theo yêu cầu rồi được cache. */
export function generateStaticParams() {
  return [];
}

/**
 * `cache` → generateMetadata và page dùng chung 1 lần gọi. Client public (không cookie) để route giữ ISR.
 * 404 (cây / bài không có) hoặc 400 (slug sai dạng) → notFound(); lỗi khác → throw (Next không cache trang lỗi).
 */
const loadArticle = cache(async (crop: string, slug: string) => {
  try {
    return await getArticle(crop, slug, publicServerHttp, articleFetchOptions.detail(crop, slug));
  } catch (error) {
    if (isAppError(error) && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }
});

export async function generateMetadata({ params }: PageProps<"/benh-cay-trong/[crop]/[slug]">): Promise<Metadata> {
  const { crop, slug } = await params;
  const article = await loadArticle(crop, slug);
  const images = article.cover
    ? [{ url: article.cover.url, width: article.cover.width, height: article.cover.height, alt: article.cover.alt }]
    : undefined;

  return {
    title: article.title,
    description: article.summary,
    alternates: { canonical: article.path },
    openGraph: {
      type: "article",
      url: article.path,
      title: article.title,
      description: article.summary,
      images,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
    },
    twitter: { card: images ? "summary_large_image" : "summary", title: article.title, description: article.summary },
    // Bài nháp vẫn xem được nhưng không cho index.
    robots: article.status === "DRAFT" ? { index: false, follow: true } : undefined,
  };
}

/** Bài viết bệnh (public, ISR) — spec disease-articles-plan.md §4.1. */
export default async function ArticlePage({ params }: PageProps<"/benh-cay-trong/[crop]/[slug]">) {
  const { crop, slug } = await params;
  const article = await loadArticle(crop, slug);

  return (
    <>
      <script
        type="application/ld+json"
        // articleJsonLd đã escape `<` — nội dung bài không thể đóng thẻ script.
        dangerouslySetInnerHTML={{ __html: articleJsonLd(article, publicEnv.siteUrl) }}
      />
      <ArticleDetail article={article} className="mx-auto w-full max-w-3xl" />
    </>
  );
}
