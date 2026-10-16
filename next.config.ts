import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

/**
 * Ảnh bài viết bệnh (object `public/` của storage, URL bất biến) được next/image tối ưu.
 * Mặc định server trả URL Firebase `?alt=media`; nếu server đặt STORAGE_PUBLIC_BASE_URL (CDN) thì đặt
 * cùng giá trị cho ARTICLE_IMAGE_BASE_URL ở đây.
 */
const articleImagePatterns: RemotePattern[] = [
  {
    protocol: "https",
    hostname: "firebasestorage.googleapis.com",
    pathname: "/v0/b/*/o/public%2F**",
    search: "?alt=media",
  },
];

const articleImageBaseUrl = process.env.ARTICLE_IMAGE_BASE_URL;
if (articleImageBaseUrl) {
  const base = new URL(articleImageBaseUrl);
  articleImagePatterns.push({
    protocol: base.protocol.replace(":", "") as "http" | "https",
    hostname: base.hostname,
    port: base.port,
    pathname: `${base.pathname.replace(/\/+$/, "")}/**`,
    search: "",
  });
}

const nextConfig: NextConfig = {
  images: { remotePatterns: articleImagePatterns },
};

export default nextConfig;
