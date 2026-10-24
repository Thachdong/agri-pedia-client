import { schema, v } from "@/shared/lib/validation";
import {
  AI_MODEL_ID_MAX_LENGTH,
  AI_MODEL_ID_PATTERN,
  DIAGNOSIS_SETTINGS_BOUNDS,
  MAX_IMAGE_MB_BOUNDS,
  TOP_ARTICLE_LIMIT_BOUNDS,
} from "../constants/admin-settings.constants";
import type {
  TDiagnosisAiModelsFormValues,
  TDiagnosisSettingsFormValues,
  TProductSuggestionAiModelFormValues,
  TTopArticleLimitFormValues,
} from "../types/admin-settings.types";

const REQUIRED = "Vui lòng nhập giá trị";

/** Số nguyên trong [min, max] — khớp server (DIAGNOSIS_INVALID_SETTINGS khi ngoài khoảng). */
const integerIn = ({ min, max }: { min: number; max: number }) =>
  v.number().integer().min(min).max(max).required().messages({ "number.base": REQUIRED, "any.required": REQUIRED });

// Kiểm số thập phân thay vì `.precision(2)` — precision của joi tự làm tròn thay vì báo lỗi.
const hasAtMostTwoDecimals = (value: number) => Number(value.toFixed(2)) === value;

/** Mirror UpdateDiagnosisSettingsDto + DIAGNOSIS_SETTINGS_BOUNDS; cây mặc định chọn từ danh sách cây bật chẩn đoán. */
export const diagnosisSettingsSchema = schema<TDiagnosisSettingsFormValues>({
  dailyFreeLimit: integerIn(DIAGNOSIS_SETTINGS_BOUNDS.dailyFreeLimit),
  defaultCropType: v.string().required(),
  maxImages: integerIn(DIAGNOSIS_SETTINGS_BOUNDS.maxImages),
  maxImageMb: v
    .number()
    .min(MAX_IMAGE_MB_BOUNDS.min)
    .max(MAX_IMAGE_MB_BOUNDS.max)
    .custom((value: number, helpers) => (hasAtMostTwoDecimals(value) ? value : helpers.error("number.decimals")))
    .required()
    .messages({
      "number.base": REQUIRED,
      "any.required": REQUIRED,
      "number.decimals": "Tối đa 2 chữ số thập phân",
    }),
  maxImageWidth: integerIn(DIAGNOSIS_SETTINGS_BOUNDS.maxImageWidth),
  maxImageHeight: integerIn(DIAGNOSIS_SETTINGS_BOUNDS.maxImageHeight),
});

/** Mirror UpdateTopArticleSettingsDto (1..50). */
export const topArticleLimitSchema = schema<TTopArticleLimitFormValues>({
  limit: integerIn(TOP_ARTICLE_LIMIT_BOUNDS),
});

/** Model id hoặc rỗng (= model env) — khớp server (DIAGNOSIS_ / PRODUCT_SUGGESTION_INVALID_SETTINGS khi sai). */
const aiModelId = () =>
  v
    .string()
    .trim()
    .allow("")
    .max(AI_MODEL_ID_MAX_LENGTH)
    .pattern(AI_MODEL_ID_PATTERN)
    .messages({
      "string.pattern.base": "Chỉ gồm chữ, số, dấu . _ - và bắt đầu bằng chữ hoặc số",
    });

/** Mirror UpdateDiagnosisAiModelsDto — cả 2 bước, rỗng = model env. */
export const diagnosisAiModelsSchema = schema<TDiagnosisAiModelsFormValues>({
  describeModel: aiModelId(),
  verifyModel: aiModelId(),
});

/** Mirror UpdateProductSuggestionAiModelDto — rỗng = model env. */
export const productSuggestionAiModelSchema = schema<TProductSuggestionAiModelFormValues>({
  model: aiModelId(),
});
