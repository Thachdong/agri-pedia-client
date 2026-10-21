import type { TApiSchema } from "@/shared/lib/http";

/** GET / PUT /admin/diagnosis/settings. */
export type TDiagnosisSettingsAdmin = TApiSchema<"DiagnosisSettingsResponse">;
export type TUpdateDiagnosisSettingsInput = TApiSchema<"UpdateDiagnosisSettingsDto">;

/** GET / PUT /admin/diagnosis/ai-models — model B1 (mô tả ảnh) / B3 (xác minh); null = model env trong `defaults`. */
export type TDiagnosisAiModels = TApiSchema<"DiagnosisAiModelsResponse">;
export type TUpdateDiagnosisAiModelsInput = TApiSchema<"UpdateDiagnosisAiModelsDto">;

/** GET / PUT /admin/knowledge/settings — số bài nổi bật mỗi cây (1..50, mặc định 10). */
export type TTopArticleSettings = TApiSchema<"TopArticleSettingsResponse">;
export type TUpdateTopArticleSettingsInput = TApiSchema<"UpdateTopArticleSettingsDto">;

/** GET / PUT /admin/knowledge/crops/:cropSlug/top-articles — bài nổi bật của 1 cây theo thứ tự, kèm `limit`. */
export type TCropTopArticles = TApiSchema<"CropTopArticlesResponse">;
export type TCropTopArticle = TCropTopArticles["articles"][number];

/**
 * PUT body — swagger sinh `SetCropTopArticlesDto` rỗng (thiếu field), viết theo server `SetCropTopArticlesDto`:
 * slug bài đã publish của cây, đầu = top, tối đa `limit`, rỗng = xoá danh sách. Sửa swagger rồi `npm run gen:api`.
 */
export type TSetCropTopArticlesInput = { articleSlugs: string[] };

/** Giá trị form cài đặt chẩn đoán — dung lượng theo MB; số chưa nhập = null (form báo lỗi). */
export type TDiagnosisSettingsFormValues = {
  dailyFreeLimit: number | null;
  /** NO_DEFAULT_CROP = không chọn. */
  defaultCropType: string;
  maxImages: number | null;
  maxImageMb: number | null;
  maxImageWidth: number | null;
  maxImageHeight: number | null;
};

export type TTopArticleLimitFormValues = { limit: number | null };
