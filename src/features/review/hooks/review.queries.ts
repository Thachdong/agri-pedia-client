import type { IHttpClient } from "@/shared/lib/http";
import { appInfiniteQueryOptions, queryKeys } from "@/shared/lib/query";
import { getDistributorReviews, getProductReviews } from "../services/review.service";
import type { TDistributorReviewsParams } from "../types/review.types";

export const REVIEWS_PAGE_SIZE = 20;

/** Review của shop theo filter, mới nhất trước, phân trang cursor (`nextCursor` null = hết). */
export const distributorReviewsQuery = (params: TDistributorReviewsParams, client?: IHttpClient) =>
  appInfiniteQueryOptions({
    queryKey: queryKeys.reviews.list(params),
    queryFn: ({ pageParam }) => getDistributorReviews({ ...params, cursor: pageParam, limit: REVIEWS_PAGE_SIZE }, client),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

/** Review của 1 product, mới nhất trước, phân trang cursor. */
export const productReviewsQuery = (productId: string, client?: IHttpClient) =>
  appInfiniteQueryOptions({
    queryKey: queryKeys.reviews.product(productId),
    queryFn: ({ pageParam }) => getProductReviews(productId, { cursor: pageParam, limit: REVIEWS_PAGE_SIZE }, client),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
