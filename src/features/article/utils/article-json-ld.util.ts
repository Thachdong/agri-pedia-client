import { ROUTES } from "@/shared/constants";
import type { TArticleDetail } from "../types/article.types";

/** Tên mục gốc của breadcrumb — dùng chung cho UI và JSON-LD. */
export const ARTICLES_INDEX_LABEL = "Bệnh cây trồng";

/**
 * JSON-LD (`Article` + `BreadcrumbList`) của trang bài viết, đã escape `<` để nhúng an toàn vào
 * `<script type="application/ld+json">` (nội dung bài không thể đóng thẻ script).
 */
export function articleJsonLd(article: TArticleDetail, siteUrl: string): string {
  const url = (path: string) => `${siteUrl}${path}`;
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.summary,
      ...(article.cover ? { image: [article.cover.url] } : {}),
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
      author: { "@type": "Organization", name: "AgriPedia" },
      publisher: { "@type": "Organization", name: "AgriPedia" },
      inLanguage: "vi",
      mainEntityOfPage: url(article.path),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { name: ARTICLES_INDEX_LABEL, path: ROUTES.articles.index },
        { name: article.crop.nameVi, path: ROUTES.articles.crop(article.crop.slug) },
        { name: article.title, path: article.path },
      ].map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: url(item.path) })),
    },
  ];
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
