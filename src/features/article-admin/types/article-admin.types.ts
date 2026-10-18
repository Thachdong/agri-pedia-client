import type { TApiSchema } from "@/shared/lib/http";

/** Nguồn gốc nội dung: AI = seed lúc deploy; ADMIN = admin viết; AI_REVIEWED = bài AI đã được admin sửa. */
export type TArticleOrigin = TApiSchema<"AdminArticleSummaryResponse">["origin"];
