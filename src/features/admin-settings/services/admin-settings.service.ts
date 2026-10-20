import { http, type IHttpClient } from "@/shared/lib/http";
import type { TDiagnosisSettingsAdmin, TUpdateDiagnosisSettingsInput } from "../types/admin-settings.types";

/** Cài đặt chẩn đoán (mặc định khi chưa lưu: 3 lượt/ngày, 5 ảnh, 5 MB, 4096px). 403 DIAGNOSIS_ADMIN_REQUIRED. */
export const getDiagnosisSettingsAdmin = (client: IHttpClient = http) =>
  client.get<TDiagnosisSettingsAdmin>("/admin/diagnosis/settings");

/**
 * Thay toàn bộ cài đặt chẩn đoán. 400 DIAGNOSIS_INVALID_SETTINGS (`details.field`) khi ngoài khoảng,
 * DIAGNOSIS_CROP_NOT_SUPPORTED khi cây mặc định không bật chẩn đoán.
 */
export const updateDiagnosisSettings = (input: TUpdateDiagnosisSettingsInput, client: IHttpClient = http) =>
  client.put<TDiagnosisSettingsAdmin>("/admin/diagnosis/settings", input);
