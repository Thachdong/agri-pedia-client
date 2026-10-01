import type { TApiSchema } from "@/shared/lib/http";

export type TCreateReviewInput = TApiSchema<"CreateReviewDto">;
export type TCreateReviewResponse = TApiSchema<"CreateReviewResponse">;
export type TReviewTargetType = TCreateReviewInput["targetType"];

/** Giá trị form review (M4 / M5) — target do dialog quyết định. `star` 0 = chưa chọn. */
export type TReviewFormValues = Pick<TCreateReviewInput, "star" | "content">;
