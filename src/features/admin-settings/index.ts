// Public API của feature `admin-settings` (cài đặt nền tảng: chẩn đoán, bài viết nổi bật — ADMIN).
export { adminDiagnosisSettingsQuery, cropTopArticlesQuery, topArticleSettingsQuery } from "./hooks/admin-settings.queries";
export { useAdminDiagnosisSettings } from "./hooks/use-admin-diagnosis-settings";
export { useCropTopArticles } from "./hooks/use-crop-top-articles";
export { useSetCropTopArticles } from "./hooks/use-set-crop-top-articles";
export { useTopArticleSettings } from "./hooks/use-top-article-settings";
export { useUpdateTopArticleLimit } from "./hooks/use-update-top-article-limit";
export { useUpdateDiagnosisSettings } from "./hooks/use-update-diagnosis-settings";
export type {
  TCropTopArticle,
  TCropTopArticles,
  TDiagnosisSettingsAdmin,
  TSetCropTopArticlesInput,
  TTopArticleSettings,
  TUpdateDiagnosisSettingsInput,
  TUpdateTopArticleSettingsInput,
} from "./types/admin-settings.types";
