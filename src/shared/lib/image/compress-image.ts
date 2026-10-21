import { decodeImage, drawToCanvas, fitWithinBox } from "./image-canvas";

/** Không decode được ảnh (định dạng trình duyệt không hỗ trợ, file hỏng). */
export class ImageDecodeError extends Error {
  constructor(cause?: unknown) {
    super("Định dạng ảnh không hỗ trợ, hãy chọn JPG/PNG", { cause });
    this.name = "ImageDecodeError";
  }
}

export type TCompressImageOptions = {
  /** Dung lượng tối đa (bytes) của JPEG kết quả. */
  maxBytes: number;
  /** Khung tối đa (px) — ảnh được thu nhỏ để vừa, không phóng to. */
  maxWidth: number;
  maxHeight: number;
  /** Chất lượng JPEG lần đầu / lần thử lại khi còn quá dung lượng. */
  quality?: number;
  retryQuality?: number;
  /** Vẫn quá dung lượng → thu nhỏ thêm theo hệ số này, tối đa `maxShrinkSteps` lần. */
  shrinkFactor?: number;
  maxShrinkSteps?: number;
};

const toJpeg = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Không nén được ảnh"))), "image/jpeg", quality),
  );

/**
 * Nén ảnh ở browser trước khi upload: xoay theo EXIF → vừa khung `maxWidth` × `maxHeight` → JPEG `quality`;
 * vượt `maxBytes` thì `retryQuality`, vẫn vượt thì thu nhỏ dần. Decode lỗi → `ImageDecodeError`.
 * Không đạt nổi giới hạn → trả bản nhỏ nhất (server báo lỗi).
 */
export async function compressImage(
  file: Blob,
  {
    maxBytes,
    maxWidth,
    maxHeight,
    quality = 0.85,
    retryQuality = 0.7,
    shrinkFactor = 0.8,
    maxShrinkSteps = 6,
  }: TCompressImageOptions,
): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await decodeImage(file);
  } catch (error) {
    throw new ImageDecodeError(error);
  }
  try {
    let { width, height } = fitWithinBox(bitmap.width, bitmap.height, maxWidth, maxHeight);
    let blob: Blob | null = null;
    for (let step = 0; step <= maxShrinkSteps; step++) {
      const { canvas } = drawToCanvas(bitmap, width, height);
      blob = await toJpeg(canvas, quality);
      if (blob.size <= maxBytes) return blob;
      blob = await toJpeg(canvas, retryQuality);
      if (blob.size <= maxBytes) return blob;
      ({ width, height } = fitWithinBox(width, height, width * shrinkFactor, height * shrinkFactor));
    }
    return blob as Blob;
  } finally {
    bitmap.close();
  }
}
