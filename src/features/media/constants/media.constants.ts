import type { TMediaType } from "../types/media.types";

/** Đuôi file server chấp nhận theo loại (POST /media/presign-url) — sai → 400 MEDIA_INVALID_EXTENSION. */
export const MEDIA_ALLOWED_EXTENSIONS = {
  IMAGE: ["jpg", "jpeg", "png", "webp"],
  VIDEO: ["mp4", "mov"],
  FILE: ["pdf"],
} as const satisfies Record<TMediaType, readonly string[]>;

/** Storage từ chối file lớn hơn mức này khi PUT lên signed URL. */
export const MEDIA_MAX_FILE_BYTES = 10 * 1024 * 1024;
