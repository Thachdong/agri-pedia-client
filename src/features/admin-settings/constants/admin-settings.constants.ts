/**
 * Khoảng giá trị của cài đặt chẩn đoán — mirror DIAGNOSIS_SETTINGS_BOUNDS của server
 * (server/src/modules/diagnosis/domain/entities/diagnosis-settings.entity.ts). Mọi giá trị là số nguyên;
 * chiều rộng / chiều cao độc lập, không ràng buộc chéo.
 */
export const DIAGNOSIS_SETTINGS_BOUNDS = {
  dailyFreeLimit: { min: 1, max: 1000 },
  maxImages: { min: 1, max: 10 },
  maxImageBytes: { min: 100 * 1024, max: 20 * 1024 * 1024 },
  maxImageWidth: { min: 256, max: 8192 },
  maxImageHeight: { min: 256, max: 8192 },
} as const;

export const BYTES_PER_MB = 1024 * 1024;

/** Dung lượng ảnh nhập theo MB, tối đa 2 chữ số thập phân (0,1 MB ≈ 102 KB ≥ 100 KB của server). */
export const MAX_IMAGE_MB_BOUNDS = {
  min: 0.1,
  max: DIAGNOSIS_SETTINGS_BOUNDS.maxImageBytes.max / BYTES_PER_MB,
} as const;

/** Số bài nổi bật mỗi cây — server TOP_ARTICLES_LIMIT_BOUNDS. */
export const TOP_ARTICLE_LIMIT_BOUNDS = { min: 1, max: 50 } as const;

/** Select "không chọn cây mặc định" — Radix Select không nhận value rỗng. */
export const NO_DEFAULT_CROP = "__none__";

/**
 * Model id của AI provider — mirror server: chữ, số, `.`, `_`, `-`, tối đa 100 ký tự, không bắt đầu bằng `.`/`_`/`-`.
 * Server không kiểm id có ở provider.
 */
export const AI_MODEL_ID_MAX_LENGTH = 100;
export const AI_MODEL_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
