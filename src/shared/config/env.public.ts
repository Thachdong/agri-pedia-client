/**
 * Biến môi trường dùng được ở cả client và server.
 * Next.js chỉ inline `process.env.NEXT_PUBLIC_*` / `NODE_ENV` khi truy cập trực tiếp từng key — không destructure `process.env`.
 */
export const publicEnv = {
  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",
} as const;
