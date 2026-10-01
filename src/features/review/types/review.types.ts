import type { TApiPaths, TApiSchema } from "@/shared/lib/http";

export type TCreateReviewInput = TApiSchema<"CreateReviewDto">;
export type TCreateReviewResponse = TApiSchema<"CreateReviewResponse">;
export type TReviewTargetType = TCreateReviewInput["targetType"];

/** Giá trị form review (M4 / M5) — target do dialog quyết định. `star` 0 = chưa chọn. */
export type TReviewFormValues = Pick<TCreateReviewInput, "star" | "content">;

/** Item GET /reviews — `productName` null với review shop (USER); `user.avatar` signed URL hoặc null. */
export type TDistributorReview = TApiSchema<"DistributorReviewResponse">;
/** Summary cả shop (shop + product), không phụ thuộc filter / cursor. */
export type TShopReviewSummary = TApiSchema<"ReviewSummaryResponse">;
export type TDistributorReviewsPage = TApiSchema<"ListDistributorReviewsResponse">;

type TDistributorReviewsQuery = TApiPaths["/reviews"]["get"]["parameters"]["query"];

/** Filter list review của shop — `cursor` / `limit` do infinite query quản lý. */
export type TDistributorReviewsParams = Omit<TDistributorReviewsQuery, "cursor" | "limit">;

/** Các trang đã gộp. */
export type TDistributorReviewsView = { summary: TShopReviewSummary; reviews: TDistributorReview[] };
