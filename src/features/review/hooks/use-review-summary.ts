import { useAppQuery } from "@/shared/lib/query";
import type { TReviewSummaryParams } from "../types/review.types";
import { toReviewSummary } from "../utils/review-summary.util";
import { reviewSummaryQuery } from "./review.queries";

/** `data` cùng shape summary shop: { avgRating, reviewCount, starCounts: { 1..5 } }. */
export const useReviewSummary = (params: TReviewSummaryParams) =>
  useAppQuery({ ...reviewSummaryQuery(params), select: toReviewSummary });
