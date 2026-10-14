import {
  IMAGE_JPEG_QUALITY,
  IMAGE_JPEG_RETRY_QUALITY,
  IMAGE_MAX_BYTES,
  IMAGE_MAX_EDGE,
} from "../constants/diagnosis.constants";
import { decodeImage, drawToCanvas, fitWithin } from "./image-canvas.util";

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

/**
 * Nén ảnh trước khi gửi chẩn đoán (chỉ chạy ở browser): xoay theo EXIF → cạnh dài ≤ 2048px → JPEG 0.85;
 * vẫn > 5 MB thì nén lại 0.7. Decode lỗi → `ImageDecodeError`.
 */
export async function compressImage(file: Blob): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await decodeImage(file);
  } catch (error) {
    throw new ImageDecodeError(error);
  }
  try {
    const { width, height } = fitWithin(bitmap.width, bitmap.height, IMAGE_MAX_EDGE);
    const { canvas } = drawToCanvas(bitmap, width, height);
    const blob = await toJpeg(canvas, IMAGE_JPEG_QUALITY);
    return blob.size > IMAGE_MAX_BYTES ? await toJpeg(canvas, IMAGE_JPEG_RETRY_QUALITY) : blob;
  } finally {
    bitmap.close();
  }
}
