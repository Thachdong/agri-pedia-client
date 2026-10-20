// Xử lý ảnh ở browser (canvas) — nén trước khi upload, đọc điểm ảnh. Không gọi ở server.
export { compressImage, ImageDecodeError, type TCompressImageOptions } from "./compress-image";
export { decodeImage, drawToCanvas, fitWithin, fitWithinBox } from "./image-canvas";
