import type { TApiSchema } from "@/shared/lib/http";

export type TCreateReviewInput = TApiSchema<"CreateReviewDto">;
export type TCreateReviewResponse = TApiSchema<"CreateReviewResponse">;
export type TReviewTargetType = TCreateReviewInput["targetType"];
