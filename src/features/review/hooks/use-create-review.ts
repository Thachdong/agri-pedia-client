import { queryKeys, useAppMutation } from "@/shared/lib/query";
import { createReview } from "../services/review.service";
import type { TCreateReviewInput } from "../types/review.types";

/** Review shop → stale review của shop đó; review sản phẩm → không biết shop từ input nên làm stale mọi review. */
export const useCreateReview = () =>
  useAppMutation({
    mutationFn: (input: TCreateReviewInput) => createReview(input),
    invalidates: ({ targetType, targetId }) =>
      targetType === "USER" ? [queryKeys.reviews.distributor(targetId)] : [queryKeys.reviews.all],
  });
