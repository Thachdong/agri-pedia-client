import type { TApiPaths, TApiSchema } from "@/shared/lib/http";

export type TCreateReviewInput = TApiSchema<"CreateReviewDto">;
export type TCreateReviewResponse = TApiSchema<"CreateReviewResponse">;
export type TReviewTargetType = TCreateReviewInput["targetType"];

/** Giá trị form review (M4 / M5) — target do dialog quyết định. `star` 0 = chưa chọn. */
export type TReviewFormValues = Pick<TCreateReviewInput, "star" | "content">;

/** Item GET /reviews — `productName` null với review shop (USER); `user.avatar` signed URL hoặc null. */
export type TDistributorReview = TApiSchema<"DistributorReviewResponse">;
/** Summary rating (shape chung) — trong GET /reviews: cả shop (shop + product), không phụ thuộc filter / cursor. */
export type TReviewSummary = TApiSchema<"ReviewSummaryResponse">;
export type TDistributorReviewsPage = TApiSchema<"ListDistributorReviewsResponse">;

type TDistributorReviewsQuery = TApiPaths["/reviews"]["get"]["parameters"]["query"];

/** Filter list review của shop — `cursor` / `limit` do infinite query quản lý. */
export type TDistributorReviewsParams = Omit<TDistributorReviewsQuery, "cursor" | "limit">;

/** Các trang đã gộp. */
export type TDistributorReviewsView = { summary: TReviewSummary; reviews: TDistributorReview[] };

/** Item GET /reviews/products/:id — `user.avatar` signed URL hoặc null. */
export type TProductReview = TApiSchema<"ProductReviewResponse">;
export type TProductReviewsPage = TApiSchema<"ListProductReviewsResponse">;

/** GET /reviews/summary — USER: chỉ review shop (không gồm product); PRODUCT: review của product. Target lạ → toàn 0. */
export type TReviewSummaryParams = TApiPaths["/reviews/summary"]["get"]["parameters"]["query"];
export type TReviewSummaryResponse = TApiSchema<"GetReviewSummaryResponse">;
