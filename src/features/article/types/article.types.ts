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
