import { http, type IHttpClient } from "@/shared/lib/http";
import type { TDiagnosisSettingsAdmin } from "../types/admin-settings.types";

/** Cài đặt chẩn đoán (mặc định khi chưa lưu: 3 lượt/ngày, 5 ảnh, 5 MB, 4096px). 403 DIAGNOSIS_ADMIN_REQUIRED. */
export const getDiagnosisSettingsAdmin = (client: IHttpClient = http) =>
  client.get<TDiagnosisSettingsAdmin>("/admin/diagnosis/settings");
