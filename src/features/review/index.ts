// Public API của feature `review` (đánh giá shop / sản phẩm của distributor).
export { ReviewShopDialog, type TReviewShopDialogProps } from "./components/review-shop-dialog";
export { distributorReviewsQuery, productReviewsQuery, reviewSummaryQuery } from "./hooks/review.queries";
export { useCreateReview } from "./hooks/use-create-review";
export { useDistributorReviews } from "./hooks/use-distributor-reviews";
export { useProductReviews } from "./hooks/use-product-reviews";
export { useReviewSummary } from "./hooks/use-review-summary";
export type {
  TCreateReviewInput,
  TDistributorReview,
  TDistributorReviewsParams,
  TProductReview,
  TReviewSummaryParams,
  TReviewTargetType,
  TReviewSummary,
} from "./types/review.types";
