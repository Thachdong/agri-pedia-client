import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

/**
 * Ảnh bài viết bệnh nằm ở bucket public riêng của server (URL bất biến) → next/image tối ưu được.
 * ARTICLE_IMAGE_BASE_URL = base URL ảnh public của server: STORAGE_PUBLIC_BASE_URL (CDN) nếu server đặt,
 * không thì `https://storage.googleapis.com/<FIREBASE_PUBLIC_STORAGE_BUCKET>`. Chỉ cho phép đúng prefix này.
 */
function articleImagePatterns(): RemotePattern[] {
  const baseUrl = process.env.ARTICLE_IMAGE_BASE_URL;
  if (!baseUrl) {
    console.warn("[next.config] ARTICLE_IMAGE_BASE_URL chưa đặt — ảnh bài viết sẽ không hiển thị. Xem .env.example.");
    return [];
  }
  const base = new URL(baseUrl);
  return [
    {
      protocol: base.protocol.replace(":", "") as "http" | "https",
      hostname: base.hostname,
      port: base.port,
      pathname: `${base.pathname.replace(/\/+$/, "")}/**`,
      search: "",
    },
  ];
}

const nextConfig: NextConfig = {
  images: { remotePatterns: articleImagePatterns() },
};

export default nextConfig;
