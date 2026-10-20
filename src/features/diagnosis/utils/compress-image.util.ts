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
import { decodeImage, drawToCanvas, fitWithinBox } from "./image-canvas.util";

/** Không decode được ảnh (định dạng trình duyệt không hỗ trợ, file hỏng). */
export class ImageDecodeError extends Error {
  constructor(cause?: unknown) {
    super("Định dạng ảnh không hỗ trợ, hãy chọn JPG/PNG", { cause });
    this.name = "ImageDecodeError";
  }
}

const toJpeg = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Không nén được ảnh"))), "image/jpeg", quality),
  );

/** Giới hạn ảnh admin cấu hình (GET /diagnoses/settings); thiếu → mặc định server. */
export type TImageLimits = Partial<Pick<TDiagnosisSettings, "maxImageBytes" | "maxImageWidth" | "maxImageHeight">>;

/**
 * Nén ảnh trước khi gửi chẩn đoán (chỉ chạy ở browser): xoay theo EXIF → vừa khung
 * min(2048, maxImageWidth) × min(2048, maxImageHeight) → JPEG 0.85; vượt maxImageBytes thì 0.7, vẫn vượt thì thu nhỏ
 * dần (×0.8, tối đa 6 lần). Decode lỗi → `ImageDecodeError`. Không đạt nổi giới hạn → trả bản nhỏ nhất (server báo lỗi).
 */
export async function compressImage(file: Blob, limits: TImageLimits = {}): Promise<Blob> {
  const maxBytes = limits.maxImageBytes ?? IMAGE_MAX_BYTES;
  const maxWidth = Math.min(IMAGE_MAX_EDGE, limits.maxImageWidth ?? IMAGE_MAX_DIMENSION);
  const maxHeight = Math.min(IMAGE_MAX_EDGE, limits.maxImageHeight ?? IMAGE_MAX_DIMENSION);

  let bitmap: ImageBitmap;
  try {
    bitmap = await decodeImage(file);
  } catch (error) {
    throw new ImageDecodeError(error);
  }
  try {
    let { width, height } = fitWithinBox(bitmap.width, bitmap.height, maxWidth, maxHeight);
    let blob: Blob | null = null;
    for (let step = 0; step <= IMAGE_SHRINK_MAX_STEPS; step++) {
      const { canvas } = drawToCanvas(bitmap, width, height);
      blob = await toJpeg(canvas, IMAGE_JPEG_QUALITY);
      if (blob.size <= maxBytes) return blob;
      blob = await toJpeg(canvas, IMAGE_JPEG_RETRY_QUALITY);
      if (blob.size <= maxBytes) return blob;
      ({ width, height } = fitWithinBox(width, height, width * IMAGE_SHRINK_FACTOR, height * IMAGE_SHRINK_FACTOR));
    }
    return blob as Blob;
  } finally {
    bitmap.close();
  }
}
