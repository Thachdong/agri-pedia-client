import type { MetadataRoute } from "next";
import { articleFetchOptions, getArticleSitemap } from "@/features/article";
import { publicEnv } from "@/shared/config";
import { ROUTES } from "@/shared/constants";
import { publicServerHttp } from "@/shared/lib/http/public-server";

/** ISR 1 giờ (= ARTICLE_REVALIDATE_SECONDS; phải là literal) — đổi bài đến qua tag `articles`. */
export const revalidate = 3600;

/**
 * Sitemap: trang danh sách, trang từng cây, mỗi bài REVIEWED (bài DRAFT không có — server đã lọc).
 * > 40.000 URL → tách bằng generateSitemaps theo cây (giới hạn 50.000 / file).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { crops, articles } = await getArticleSitemap(publicServerHttp, articleFetchOptions.sitemap());
  const url = (path: string) => `${publicEnv.siteUrl}${path}`;
  const latest = crops.map((crop) => crop.updatedAt).sort().at(-1);

  return [
    { url: url(ROUTES.articles.index), lastModified: latest, changeFrequency: "weekly", priority: 0.8 },
    ...crops.map((crop) => ({
      url: url(ROUTES.articles.crop(crop.slug)),
      lastModified: crop.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...articles.map((article) => ({
      url: url(article.path),
      lastModified: article.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
