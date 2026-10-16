import type { TApiSchema } from "@/shared/lib/http";

/** GET /knowledge/articles/crops — cây có ít nhất 1 bài (kể cả cây chưa bật chẩn đoán). `slug` dùng trong URL. */
export type TArticleCrop = TApiSchema<"ArticleCropItemResponse">;
export type TArticleCropsResponse = TApiSchema<"ListArticleCropsResponse">;

/** GET /knowledge/articles — gồm cả bài DRAFT (render noindex). `nextCursor` null = hết. */
export type TArticleListResponse = TApiSchema<"ListArticlesResponse">;
export type TArticleListItem = TArticleListResponse["articles"][number];
export type TArticleStatus = TArticleListItem["status"];
/** Nhóm của bệnh mà bài viết nói tới — tab lọc ở trang danh sách. */
export type TArticleCategory = NonNullable<TArticleListItem["disease"]>["category"];

/** Query của GET /knowledge/articles (cursor do service / infinite query điền). */
export type TArticleListParams = {
  crop: string;
  category?: TArticleCategory;
  cursor?: string;
  limit?: number;
};
/** Filter là một phần của query key (không gồm cursor / limit). */
export type TArticleListFilters = Pick<TArticleListParams, "crop" | "category">;

/**
 * GET /knowledge/articles/:cropSlug/:slug — `markdown` đã resolve URL ảnh public và link `/diseases/<CODE>`;
 * directive `:::warning`, `:::tip`, `::disease-card{code}`, `::cta-diagnosis` để client render.
 */
export type TArticleDetail = TApiSchema<"ArticleDetailResponse">;
export type TArticleDisease = NonNullable<TArticleDetail["disease"]>;
export type TArticleVerification = TArticleDisease["verification"];
export type TArticleAffectedPart = TArticleDisease["affectedParts"][number];
export type TArticleCover = NonNullable<TArticleDetail["cover"]>;
export type TArticleImage = TArticleDetail["images"][number];
/** Bệnh dễ nhầm / liên quan — `path` null = bệnh chưa có bài (card không link). */
export type TRelatedDisease = TArticleDetail["relatedDiseases"][number];
export type TArticleSource = TArticleDetail["sources"][number];

/** GET /knowledge/articles/sitemap — chỉ bài REVIEWED, không phân trang. */
export type TArticleSitemap = TApiSchema<"ArticleSitemapResponse">;

/** `article` của GET /knowledge/diseases/:code — đường dẫn + trạng thái bài của bệnh, null = chưa có bài. */
export type TDiseaseArticleLink = TApiSchema<"DiseaseArticleResponse">;
/** Phần của GET /knowledge/diseases/:code mà feature article cần. */
export type TDiseaseArticleSource = Pick<TApiSchema<"DiseaseDetailResponse">, "article">;
