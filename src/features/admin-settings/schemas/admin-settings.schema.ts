import { schema, v } from "@/shared/lib/validation";
import {
  DIAGNOSIS_SETTINGS_BOUNDS,
  MAX_IMAGE_MB_BOUNDS,
  TOP_ARTICLE_LIMIT_BOUNDS,
} from "../constants/admin-settings.constants";
import type { TDiagnosisSettingsFormValues, TTopArticleLimitFormValues } from "../types/admin-settings.types";

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
