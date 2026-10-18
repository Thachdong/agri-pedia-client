import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  ADMIN_HOME_PATH,
  ADMIN_PATH,
  ADMIN_ROLE,
  GUEST_ONLY_PATHS,
  HOME_PATH,
  LOGIN_NEXT_PARAM,
  LOGIN_PATH,
  PROTECTED_PATHS,
  REFRESH_TOKEN_COOKIE,
  ROLE_COOKIE,
} from "@/shared/lib/auth/auth.constants";

const matchesPath = (pathname: string, paths: readonly string[]) =>
  paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

/**
 * Route guard (chạy trước render, không gọi NestJS).
 * Có cookie access hoặc refresh = có phiên; access hết hạn sẽ được BFF refresh khi gọi API.
 * Cookie role (ghi lúc login) tách ADMIN khỏi front pages — chỉ điều hướng, quyền thật kiểm ở layout `/admin` + NestJS.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has(ACCESS_TOKEN_COOKIE) || request.cookies.has(REFRESH_TOKEN_COOKIE);

  if (!hasSession) {
    if (!matchesPath(pathname, PROTECTED_PATHS)) return NextResponse.next();
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set(LOGIN_NEXT_PARAM, `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  const isAdmin = request.cookies.get(ROLE_COOKIE)?.value === ADMIN_ROLE;
  const inAdminArea = matchesPath(pathname, [ADMIN_PATH]);

  // ADMIN chỉ dùng khu quản trị; user thường không vào khu quản trị.
  if (isAdmin && !inAdminArea) return NextResponse.redirect(new URL(ADMIN_HOME_PATH, request.url));
  if (!isAdmin && inAdminArea) return NextResponse.redirect(new URL(HOME_PATH, request.url));

  if (matchesPath(pathname, GUEST_ONLY_PATHS)) {
    return NextResponse.redirect(new URL(HOME_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Bỏ qua API (BFF), asset của Next và file tĩnh.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.\\w+$).*)"],
};
