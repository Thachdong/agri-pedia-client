import { http, type IHttpClient } from "@/shared/lib/http";
import type {
  TCropTopArticles,
  TDiagnosisAiModels,
  TDiagnosisSettingsAdmin,
  TProductSuggestionAiModel,
  TSetCropTopArticlesInput,
  TTopArticleSettings,
  TUpdateDiagnosisAiModelsInput,
  TUpdateDiagnosisSettingsInput,
  TUpdateProductSuggestionAiModelInput,
  TUpdateTopArticleSettingsInput,
} from "../types/admin-settings.types";

/** Cài đặt chẩn đoán (mặc định khi chưa lưu: 3 lượt/ngày, 5 ảnh, 5 MB, 4096px). 403 DIAGNOSIS_ADMIN_REQUIRED. */
export const getDiagnosisSettingsAdmin = (client: IHttpClient = http) =>
  client.get<TDiagnosisSettingsAdmin>("/admin/diagnosis/settings");

/**
 * Thay toàn bộ cài đặt chẩn đoán. 400 DIAGNOSIS_INVALID_SETTINGS (`details.field`) khi ngoài khoảng,
 * DIAGNOSIS_CROP_NOT_SUPPORTED khi cây mặc định không bật chẩn đoán.
 */
export const updateDiagnosisSettings = (input: TUpdateDiagnosisSettingsInput, client: IHttpClient = http) =>
  client.put<TDiagnosisSettingsAdmin>("/admin/diagnosis/settings", input);

/** AI model của các bước chẩn đoán (null = model env trong `defaults`). 403 DIAGNOSIS_ADMIN_REQUIRED. */
export const getDiagnosisAiModels = (client: IHttpClient = http) =>
  client.get<TDiagnosisAiModels>("/admin/diagnosis/ai-models");

/**
 * Thay AI model của các bước chẩn đoán (cả 2 field bắt buộc, null = model env). Áp cho ca tạo sau đó.
 * 400 DIAGNOSIS_INVALID_SETTINGS (`details.field`) khi id sai định dạng; id không có ở provider → chẩn đoán lỗi.
 */
export const updateDiagnosisAiModels = (input: TUpdateDiagnosisAiModelsInput, client: IHttpClient = http) =>
  client.put<TDiagnosisAiModels>("/admin/diagnosis/ai-models", input);

/** AI model đọc tên sản phẩm từ ảnh (null = model env `defaults.model`). 403 PRODUCT_ADMIN_REQUIRED. */
export const getProductSuggestionAiModel = (client: IHttpClient = http) =>
  client.get<TProductSuggestionAiModel>("/admin/product-suggestion/ai-model");

/**
 * Thay AI model đọc tên sản phẩm (`model` bắt buộc, null = model env). Áp cho lần gợi ý kế tiếp.
 * 400 PRODUCT_SUGGESTION_INVALID_SETTINGS khi id sai định dạng; id không có ở provider → gợi ý lỗi.
 */
export const updateProductSuggestionAiModel = (input: TUpdateProductSuggestionAiModelInput, client: IHttpClient = http) =>
  client.put<TProductSuggestionAiModel>("/admin/product-suggestion/ai-model", input);

/** Số bài nổi bật tối đa mỗi cây (mặc định 10). 403 KNOWLEDGE_ADMIN_REQUIRED. */
export const getTopArticleSettings = (client: IHttpClient = http) =>
  client.get<TTopArticleSettings>("/admin/knowledge/settings");

/** Đổi số bài nổi bật mỗi cây (1..50). Danh sách đang dài hơn giữ nguyên; trang public chỉ hiện `limit` bài đầu. */
export const updateTopArticleSettings = (input: TUpdateTopArticleSettingsInput, client: IHttpClient = http) =>
  client.put<TTopArticleSettings>("/admin/knowledge/settings", input);

/** Bài nổi bật của 1 cây theo thứ tự (bài đã unpublish vẫn nằm trong danh sách, `isPublished` false). 404 KNOWLEDGE_CROP_NOT_FOUND. */
export const getCropTopArticles = (cropSlug: string, client: IHttpClient = http) =>
  client.get<TCropTopArticles>(`/admin/knowledge/crops/${encodeURIComponent(cropSlug)}/top-articles`);

/** Thay danh sách bài nổi bật của 1 cây. 400 KNOWLEDGE_TOP_ARTICLES_INVALID (`details` = { reason, articles }). */
export const setCropTopArticles = (cropSlug: string, input: TSetCropTopArticlesInput, client: IHttpClient = http) =>
  client.put<TCropTopArticles>(`/admin/knowledge/crops/${encodeURIComponent(cropSlug)}/top-articles`, input);
