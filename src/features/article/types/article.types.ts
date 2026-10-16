import type { TApiSchema } from "@/shared/lib/http";

/** GET /knowledge/articles/crops — cây có ít nhất 1 bài (kể cả cây chưa bật chẩn đoán). `slug` dùng trong URL. */
export type TArticleCrop = TApiSchema<"ArticleCropItemResponse">;
export type TArticleCropsResponse = TApiSchema<"ListArticleCropsResponse">;
