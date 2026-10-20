// Public API của feature `admin-settings` (cài đặt nền tảng: chẩn đoán, bài viết nổi bật — ADMIN).
export { adminDiagnosisSettingsQuery } from "./hooks/admin-settings.queries";
export { useAdminDiagnosisSettings } from "./hooks/use-admin-diagnosis-settings";
export type { TDiagnosisSettingsAdmin, TUpdateDiagnosisSettingsInput } from "./types/admin-settings.types";
