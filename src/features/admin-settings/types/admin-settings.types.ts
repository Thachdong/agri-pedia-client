import type { TApiSchema } from "@/shared/lib/http";

/** GET / PUT /admin/diagnosis/settings. */
export type TDiagnosisSettingsAdmin = TApiSchema<"DiagnosisSettingsResponse">;
export type TUpdateDiagnosisSettingsInput = TApiSchema<"UpdateDiagnosisSettingsDto">;

/** GET / PUT /admin/knowledge/settings — số bài nổi bật mỗi cây (1..50, mặc định 10). */
export type TTopArticleSettings = TApiSchema<"TopArticleSettingsResponse">;
export type TUpdateTopArticleSettingsInput = TApiSchema<"UpdateTopArticleSettingsDto">;
