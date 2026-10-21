// Public API của feature `admin-settings` (cài đặt nền tảng: chẩn đoán, bài viết nổi bật — ADMIN).
export { DiagnosisSettingsForm, type TDiagnosisSettingsFormProps } from "./components/diagnosis-settings-form";
export { TopArticleLimitForm, type TTopArticleLimitFormProps } from "./components/top-article-limit-form";
export { TopArticlesEditor, type TTopArticlesEditorProps } from "./components/top-articles-editor";
export {
  adminDiagnosisAiModelsQuery,
  adminDiagnosisSettingsQuery,
  cropTopArticlesQuery,
  productSuggestionAiModelQuery,
  topArticleSettingsQuery,
} from "./hooks/admin-settings.queries";
export { useAdminDiagnosisAiModels } from "./hooks/use-admin-diagnosis-ai-models";
export { useAdminDiagnosisSettings } from "./hooks/use-admin-diagnosis-settings";
export { useProductSuggestionAiModel } from "./hooks/use-product-suggestion-ai-model";
export { useCropTopArticles } from "./hooks/use-crop-top-articles";
export { useSetCropTopArticles } from "./hooks/use-set-crop-top-articles";
export { useTopArticleSettings } from "./hooks/use-top-article-settings";
export { useUpdateTopArticleLimit } from "./hooks/use-update-top-article-limit";
export { useUpdateDiagnosisAiModels } from "./hooks/use-update-diagnosis-ai-models";
export { useUpdateDiagnosisSettings } from "./hooks/use-update-diagnosis-settings";
export type {
  TCropTopArticle,
  TCropTopArticles,
  TDiagnosisAiModels,
  TDiagnosisSettingsAdmin,
  TProductSuggestionAiModel,
  TSetCropTopArticlesInput,
  TTopArticleSettings,
  TUpdateDiagnosisAiModelsInput,
  TUpdateDiagnosisSettingsInput,
  TUpdateTopArticleSettingsInput,
} from "./types/admin-settings.types";
