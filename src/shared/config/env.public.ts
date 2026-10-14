/**
 * Biến môi trường dùng được ở cả client và server.
 * Next.js chỉ inline `process.env.NEXT_PUBLIC_*` / `NODE_ENV` khi truy cập trực tiếp từng key — không destructure `process.env`.
 */
export const publicEnv = {
  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",
  /** Tile server của map (Leaflet `{s}/{z}/{x}/{y}`). Mặc định OSM public — traffic lớn nên đổi provider. */
  mapTileUrl: process.env.NEXT_PUBLIC_MAP_TILE_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  mapTileAttribution:
    process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION ||
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  /** socket.io server (NestJS, cùng port HTTP) — browser kết nối thẳng bằng realtime ticket, không mang token. */
  realtimeUrl: process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3000",
} as const;
