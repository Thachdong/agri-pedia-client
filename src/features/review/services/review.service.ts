import { http, type IHttpClient } from "@/shared/lib/http";
import type {
  TCreateReviewInput,
  TCreateReviewResponse,
  TDistributorReviewsPage,
  TDistributorReviewsParams,
  TProductReviewsPage,
} from "../types/review.types";

/**
 * Chỉ FARMER ACTIVE (403 REVIEW_REVIEWER_NOT_ALLOWED); mỗi target một lần (409 REVIEW_ALREADY_EXISTS).
 * USER: targetId = distributor id; PRODUCT: targetId = product id (sản phẩm phải ACTIVE).
 */
export const createReview = (input: TCreateReviewInput, client: IHttpClient = http) =>
  client.post<TCreateReviewResponse>("/reviews", input);

/** Public — review shop (USER) + review mọi product của shop (kể cả product đã xoá), mới nhất trước. */
export const getDistributorReviews = (
  params: TDistributorReviewsParams & { cursor?: string; limit?: number },
  client: IHttpClient = http,
) => client.get<TDistributorReviewsPage>("/reviews", { query: params });

/** Public — review của 1 product (mọi status), mới nhất trước; product đã xoá / lạ → 404 REVIEW_TARGET_NOT_FOUND. */
export const getProductReviews = (
  productId: string,
  { cursor, limit }: { cursor?: string; limit?: number } = {},
  client: IHttpClient = http,
) => client.get<TProductReviewsPage>(`/reviews/products/${encodeURIComponent(productId)}`, { query: { cursor, limit } });
