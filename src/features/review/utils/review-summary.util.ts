import type { TReviewSummaryResponse, TReviewSummary } from "../types/review.types";

/** Đưa summary của GET /reviews/summary về cùng shape với summary shop (GET /reviews) — RatingSummary dùng 1 shape. */
export const toReviewSummary = ({
  avgRating,
  reviewCount,
  oneStarCount,
  twoStarCount,
  threeStarCount,
  fourStarCount,
  fiveStarCount,
}: TReviewSummaryResponse): TReviewSummary => ({
  avgRating,
  reviewCount,
  starCounts: { 1: oneStarCount, 2: twoStarCount, 3: threeStarCount, 4: fourStarCount, 5: fiveStarCount },
});
