import { schema, v } from "@/shared/lib/validation";
import type { TReviewFormValues } from "../types/review.types";

const STAR_REQUIRED = "Vui lòng chọn số sao";

/** Mirror CreateReviewDto + action 15 (specs/api.md): star nguyên 1..5, content 1..1000 ký tự sau trim. */
export const reviewSchema = schema<TReviewFormValues>({
  star: v
    .number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({ "number.min": STAR_REQUIRED, "any.required": STAR_REQUIRED }),
  content: v.string().trim().min(1).max(1000).required().messages({ "string.empty": "Vui lòng nhập nội dung đánh giá" }),
});
