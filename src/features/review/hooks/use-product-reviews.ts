import { useAppInfiniteQuery } from "@/shared/lib/query";
import type { TProductReview, TProductReviewsPage } from "../types/review.types";
import { productReviewsQuery } from "./review.queries";

const toItems = ({ pages }: { pages: TProductReviewsPage[] }): TProductReview[] => pages.flatMap((page) => page.reviews);

/** `data` = review của mọi trang đã tải (gộp). */
export const useProductReviews = (productId: string) =>
  useAppInfiniteQuery({ ...productReviewsQuery(productId), select: toItems });
