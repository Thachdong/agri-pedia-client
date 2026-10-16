/**
 * Helper canvas dùng chung cho nén ảnh và kiểm tra mờ — CHỈ gọi ở browser (event handler / effect).
 */

/** Decode file ảnh, xoay theo EXIF. Trình duyệt không decode được (vd. HEIC trên Chrome) → reject. */
export const decodeImage = (file: Blob) => createImageBitmap(file, { imageOrientation: "from-image" });

/** Kích thước sau khi thu nhỏ để cạnh dài ≤ `maxEdge` (không phóng to). */
export const fitWithin = (width: number, height: number, maxEdge: number) => {
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
};

/** Vẽ bitmap lên canvas mới với kích thước cho trước. */
export const drawToCanvas = (bitmap: ImageBitmap, width: number, height: number) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas 2D không khả dụng");
  context.drawImage(bitmap, 0, 0, width, height);
  return { canvas, context };
};
