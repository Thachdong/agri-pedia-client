import type { TApiSchema } from "@/shared/lib/http";

/** Nguồn gốc nội dung: AI = seed lúc deploy; ADMIN = admin viết; AI_REVIEWED = bài AI đã được admin sửa. */
export type TArticleOrigin = TApiSchema<"AdminArticleSummaryResponse">["origin"];

/** GET /admin/knowledge/crops — mọi cây (kể cả chưa có bài). `targetCount - articleCount` = số bệnh/variant chưa có bài. */
export type TAdminArticleCropsResponse = TApiSchema<"ListAdminArticleCropsResponse">;
export type TAdminArticleCrop = TApiSchema<"AdminArticleCropItemResponse">;
