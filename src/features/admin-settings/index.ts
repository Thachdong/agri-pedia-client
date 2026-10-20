// Public API của feature `admin-settings` (cài đặt nền tảng: chẩn đoán, bài viết nổi bật — ADMIN).
export { adminDiagnosisSettingsQuery, topArticleSettingsQuery } from "./hooks/admin-settings.queries";
export { useAdminDiagnosisSettings } from "./hooks/use-admin-diagnosis-settings";
export { useTopArticleSettings } from "./hooks/use-top-article-settings";
export { useUpdateDiagnosisSettings } from "./hooks/use-update-diagnosis-settings";
export type {
  TDiagnosisSettingsAdmin,
  TTopArticleSettings,
  TUpdateDiagnosisSettingsInput,
  TUpdateTopArticleSettingsInput,
} from "./types/admin-settings.types";
