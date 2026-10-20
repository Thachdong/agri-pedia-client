import "server-only";
import { serverEnv } from "@/shared/config/env.server";
import { createHttpClient } from "./create-http-client";

/**
 * Client cho server gọi endpoint PUBLIC của NestJS — không đọc cookie, không gửi token.
 * Dùng cho route ISR (bài viết bệnh, sitemap): `cookies()` sẽ làm route thành dynamic và mất cache.
 * Import `@/shared/lib/http/public-server`.
 */
export const publicServerHttp = createHttpClient({ baseUrl: serverEnv.API_URL });
