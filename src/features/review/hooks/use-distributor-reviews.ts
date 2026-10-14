import { useAppInfiniteQuery } from "@/shared/lib/query";
import type { TDistributorReviewsPage, TDistributorReviewsParams, TDistributorReviewsView } from "../types/review.types";
import { distributorReviewsQuery } from "./review.queries";

// summary lấy từ trang đầu (refetch luôn tải lại trang đầu trước) — server tính trên mọi review của shop.
const toView = ({ pages }: { pages: TDistributorReviewsPage[] }): TDistributorReviewsView => ({
  summary: pages[0].summary,
  reviews: pages.flatMap((page) => page.reviews),
});

export const useDistributorReviews = (params: TDistributorReviewsParams) =>
  useAppInfiniteQuery({ ...distributorReviewsQuery(params), select: toView });
