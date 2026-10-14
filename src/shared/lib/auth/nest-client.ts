import "server-only";
import { serverEnv } from "@/shared/config/env.server";
import { createHttpClient } from "@/shared/lib/http/create-http-client";
import type { IHttpClient } from "@/shared/lib/http";

/** Client gọi NestJS với access token truyền tường minh (không đọc cookie) — dùng trong BFF auth/forward. */
export function createNestClient(accessToken?: string): IHttpClient {
  return createHttpClient({
    baseUrl: serverEnv.API_URL,
    getHeaders: (): HeadersInit => (accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  });
}
