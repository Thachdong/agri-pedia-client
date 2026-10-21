import { compressImage } from "@/shared/lib/image";
import {
  IMAGE_JPEG_QUALITY,
  IMAGE_JPEG_RETRY_QUALITY,
  IMAGE_MAX_BYTES,
  IMAGE_MAX_DIMENSION,
  IMAGE_MAX_EDGE,
  IMAGE_SHRINK_FACTOR,
  IMAGE_SHRINK_MAX_STEPS,
} from "../constants/diagnosis.constants";
import type { TDiagnosisSettings } from "../types/diagnosis.types";

/** Giới hạn ảnh admin cấu hình (GET /diagnoses/settings); thiếu → mặc định server. */
export type TImageLimits = Partial<Pick<TDiagnosisSettings, "maxImageBytes" | "maxImageWidth" | "maxImageHeight">>;

/**
 * Nén ảnh chẩn đoán: vừa khung min(2048, maxImageWidth) × min(2048, maxImageHeight), ≤ maxImageBytes
 * (JPEG 0.85 → 0.7 → thu nhỏ dần ×0.8, tối đa 6 lần). Decode lỗi → `ImageDecodeError` (@/shared/lib/image).
 */
export const compressDiagnosisImage = (file: Blob, limits: TImageLimits = {}) =>
  compressImage(file, {
    maxBytes: limits.maxImageBytes ?? IMAGE_MAX_BYTES,
    maxWidth: Math.min(IMAGE_MAX_EDGE, limits.maxImageWidth ?? IMAGE_MAX_DIMENSION),
    maxHeight: Math.min(IMAGE_MAX_EDGE, limits.maxImageHeight ?? IMAGE_MAX_DIMENSION),
    quality: IMAGE_JPEG_QUALITY,
    retryQuality: IMAGE_JPEG_RETRY_QUALITY,
    shrinkFactor: IMAGE_SHRINK_FACTOR,
    maxShrinkSteps: IMAGE_SHRINK_MAX_STEPS,
  });
