import { http, type IHttpClient } from "@/shared/lib/http";
import type { TCreateReviewInput, TCreateReviewResponse } from "../types/review.types";

/**
 * Chỉ FARMER ACTIVE (403 REVIEW_REVIEWER_NOT_ALLOWED); mỗi target một lần (409 REVIEW_ALREADY_EXISTS).
 * USER: targetId = distributor id; PRODUCT: targetId = product id (sản phẩm phải ACTIVE).
 */
export const createReview = (input: TCreateReviewInput, client: IHttpClient = http) =>
  client.post<TCreateReviewResponse>("/reviews", input);
