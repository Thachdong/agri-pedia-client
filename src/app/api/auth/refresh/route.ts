import { NextResponse, type NextRequest } from "next/server";
import { LOGIN_NEXT_PARAM, LOGIN_PATH, REFRESH_NEXT_PARAM } from "@/shared/lib/auth/auth.constants";
import {
  forbiddenOriginResponse,
  isSameOrigin,
  refreshTokens,
  sessionExpiredResponse,
  toErrorResponse,
} from "@/shared/lib/auth";

/** Làm mới cặp token từ cookie refresh. 204 khi thành công, 401 SESSION_EXPIRED khi phiên hết hạn. */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return forbiddenOriginResponse();

  try {
    const pair = await refreshTokens();
    return pair ? new NextResponse(null, { status: 204 }) : sessionExpiredResponse();
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** Chỉ nhận path nội bộ ("/..."), không "//host", "\\", ký tự điều khiển hay route BFF. */
const safeNextPath = (value: string | null, fallback: string): string => {
  if (!value?.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(value)) return fallback;
  if (value === "/api" || value.startsWith("/api/") || value.startsWith("/api?")) return fallback;
  return value;
};

/**
 * Làm mới phiên khi điều hướng (proxy gửi tới đây khi trang cần token mà cookie access đã hết hạn).
 * Thành công → quay lại `next`; phiên hết hạn (cookie đã bị xoá) → trang đăng nhập kèm `next`.
 * Lỗi mạng / NestJS → 502, không redirect (tránh vòng lặp proxy ↔ trang).
 */
export async function GET(request: NextRequest) {
  const next = safeNextPath(request.nextUrl.searchParams.get(REFRESH_NEXT_PARAM), "/");
  try {
    if (await refreshTokens()) return NextResponse.redirect(new URL(next, request.url));
  } catch (error) {
    return toErrorResponse(error);
  }
  const loginUrl = new URL(LOGIN_PATH, request.url);
  loginUrl.searchParams.set(LOGIN_NEXT_PARAM, next);
  return NextResponse.redirect(loginUrl);
}
