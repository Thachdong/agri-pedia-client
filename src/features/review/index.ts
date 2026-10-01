// Public API của feature `review` (đánh giá shop / sản phẩm của distributor).
export { ReviewShopDialog, type TReviewShopDialogProps } from "./components/review-shop-dialog";
export { distributorReviewsQuery } from "./hooks/review.queries";
export { useCreateReview } from "./hooks/use-create-review";
export { useDistributorReviews } from "./hooks/use-distributor-reviews";
export type {
  TCreateReviewInput,
  TDistributorReview,
  TDistributorReviewsParams,
  TReviewTargetType,
  TShopReviewSummary,
} from "./types/review.types";
