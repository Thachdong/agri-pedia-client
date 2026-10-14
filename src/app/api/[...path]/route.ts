import { NextResponse, type NextRequest } from "next/server";
import { serverEnv } from "@/shared/config/env.server";
import {
  clearAuthCookies,
  forbiddenOriginResponse,
  getAccessToken,
  getRefreshToken,
  isSameOrigin,
  refreshTokens,
  sessionExpiredResponse,
  toErrorResponse,
} from "@/shared/lib/auth";

/**
 * BFF forward: browser `/api/<path>` → NestJS `<API_URL>/<path>`, gắn Bearer từ cookie httpOnly.
 * `/api/auth/{login,refresh,logout}` là route riêng (cụ thể hơn nên được ưu tiên).
 */

const SAFE_METHODS = new Set(["GET", "HEAD"]);
const REQUEST_HEADERS = ["content-type", "accept", "accept-language", "x-request-id"];
const RESPONSE_HEADERS = ["content-type", "content-disposition", "cache-control", "etag", "last-modified", "x-request-id"];
/** Endpoint trả / nhận token — chỉ đi qua route BFF auth, không forward thẳng. */
const BFF_ONLY_PATHS = ["/auth/login", "/auth/refresh-token", "/auth/logout"];

function jsonError(status: number, code: string, message: string): NextResponse {
  return NextResponse.json({ statusCode: status, code, message }, { status });
}

/** Chặn thoát khỏi API_URL (SSRF / path traversal): `..`, `\`, `//`, encode kép. */
function resolveTarget(request: NextRequest): { url: URL; path: string } | null {
  const rawPath = request.nextUrl.pathname.replace(/^\/api/, "");
  let path: string;
  try {
    path = decodeURIComponent(rawPath);
  } catch {
    return null;
  }
  if (!path.startsWith("/") || path.includes("..") || path.includes("\\") || path.includes("//") || path.includes("%")) {
    return null;
  }

  const base = new URL(`${serverEnv.API_URL}/`);
  const url = new URL(`${rawPath.slice(1)}${request.nextUrl.search}`, base);
  if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) return null;
  return { url, path };
}

function pickHeaders(source: Headers, names: string[]): Headers {
  const headers = new Headers();
  for (const name of names) {
    const value = source.get(name);
    if (value) headers.set(name, value);
  }
  return headers;
}

async function forward(request: NextRequest): Promise<Response> {
  const method = request.method.toUpperCase();
  if (!SAFE_METHODS.has(method) && !isSameOrigin(request)) return forbiddenOriginResponse();

  const target = resolveTarget(request);
  if (!target) return jsonError(400, "INVALID_PATH", "Đường dẫn không hợp lệ");
  if (BFF_ONLY_PATHS.some((path) => target.path === path || target.path.startsWith(`${path}/`))) {
    return jsonError(404, "NOT_FOUND", "Không tìm thấy");
  }

  const body = SAFE_METHODS.has(method) ? undefined : await request.arrayBuffer();
  const baseHeaders = pickHeaders(request.headers, REQUEST_HEADERS);
  const send = (accessToken?: string) => {
    const headers = new Headers(baseHeaders);
    if (accessToken) headers.set("authorization", `Bearer ${accessToken}`);
    return fetch(target.url, { method, headers, body, redirect: "manual", cache: "no-store" });
  };

  let upstream: Response;
  try {
    const accessToken = await getAccessToken();
    upstream = await send(accessToken);

    if (upstream.status === 401) {
      const hasRefreshToken = Boolean(await getRefreshToken());
      if (hasRefreshToken) {
        // Access token hết hạn → refresh một lần rồi gửi lại (refreshTokens tự ghi / xóa cookie).
        const pair = await refreshTokens();
        if (!pair) return sessionExpiredResponse();
        upstream = await send(pair.accessToken);
      } else if (accessToken) {
        // Có access nhưng không còn refresh → phiên đã hết.
        await clearAuthCookies();
        return sessionExpiredResponse();
      }
      // Khách (không cookie): trả nguyên 401 của NestJS để UI nhắc đăng nhập.
    }
  } catch (error) {
    return toErrorResponse(error);
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: pickHeaders(upstream.headers, RESPONSE_HEADERS),
  });
}

export {
  forward as DELETE,
  forward as GET,
  forward as HEAD,
  forward as PATCH,
  forward as POST,
  forward as PUT,
};
