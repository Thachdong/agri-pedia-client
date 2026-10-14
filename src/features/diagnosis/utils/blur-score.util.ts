import { BLUR_SAMPLE_EDGE, BLUR_THRESHOLD } from "../constants/diagnosis.constants";
import { decodeImage, drawToCanvas, fitWithin } from "./image-canvas.util";

/** Phương sai của Laplacian (kernel 4-lân cận) trên ảnh xám — càng nhỏ càng mờ. */
export function laplacianVariance({ data, width, height }: ImageData): number {
  const gray = new Float32Array(width * height);
  for (let i = 0; i < gray.length; i += 1) {
    const p = i * 4;
    gray[i] = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
  }
  let sum = 0;
  let sumSquares = 0;
  let count = 0;
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const i = y * width + x;
      const value = gray[i - width] + gray[i + width] + gray[i - 1] + gray[i + 1] - 4 * gray[i];
      sum += value;
      sumSquares += value * value;
      count += 1;
    }
  }
  if (count === 0) return 0;
  const mean = sum / count;
  return sumSquares / count - mean * mean;
}

/**
 * Ảnh có thể bị mờ? (chỉ chạy ở browser) — đo trên bản thu nhỏ cạnh dài 512px để nhanh và ổn định giữa các cỡ ảnh.
 * Decode lỗi → `false` (lỗi định dạng do bước nén báo).
 */
export async function isLikelyBlurry(file: Blob): Promise<boolean> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await decodeImage(file);
  } catch {
    return false;
  }
  try {
    const { width, height } = fitWithin(bitmap.width, bitmap.height, BLUR_SAMPLE_EDGE);
    const { context } = drawToCanvas(bitmap, width, height);
    return laplacianVariance(context.getImageData(0, 0, width, height)) < BLUR_THRESHOLD;
  } finally {
    bitmap.close();
  }
}
