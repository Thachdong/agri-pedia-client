import { http, type IHttpClient } from "@/shared/lib/http";
import type {
  TDiagnosisSettingsAdmin,
  TTopArticleSettings,
  TUpdateDiagnosisSettingsInput,
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

/** Số bài nổi bật tối đa mỗi cây (mặc định 10). 403 KNOWLEDGE_ADMIN_REQUIRED. */
export const getTopArticleSettings = (client: IHttpClient = http) =>
  client.get<TTopArticleSettings>("/admin/knowledge/settings");
