/** Plain constants — được import cả từ `src/proxy.ts` (không import module server-only ở đây). */
import { ROUTES } from "@/shared/constants";

/** Tên cookie chứa token NestJS (httpOnly). */
export const ACCESS_TOKEN_COOKIE = "ap_access_token";
export const REFRESH_TOKEN_COOKIE = "ap_refresh_token";

/** Dùng khi không đọc được `exp` của access token — khớp AUTH_ACCESS_TOKEN_TTL_SECONDS (900) của server. */
export const ACCESS_TOKEN_FALLBACK_MAX_AGE = 15 * 60;

export const LOGIN_PATH = ROUTES.auth.login;
export const HOME_PATH = ROUTES.home;
export const LOGIN_NEXT_PARAM = "next";

/** Đã đăng nhập mà vào các trang này → về HOME_PATH. */
export const GUEST_ONLY_PATHS: readonly string[] = [
  ROUTES.auth.login,
  ROUTES.auth.register,
  ROUTES.auth.activate,
];

/** Chưa đăng nhập mà vào các trang này (và trang con) → về LOGIN_PATH. Wireframe hiện chưa có trang private. */
export const PROTECTED_PATHS: readonly string[] = [];
