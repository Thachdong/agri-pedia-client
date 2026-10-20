/** Plain constants — được import cả từ `src/proxy.ts` (không import module server-only ở đây). */
import { ROUTES } from "@/shared/constants";

/** Tên cookie chứa token NestJS (httpOnly). */
export const ACCESS_TOKEN_COOKIE = "ap_access_token";
export const REFRESH_TOKEN_COOKIE = "ap_refresh_token";
/**
 * Role của user đang đăng nhập (httpOnly, ghi lúc login) — CHỈ để proxy điều hướng ADMIN ↔ front pages.
 * Không phải quyền: sửa cookie không vượt được guard `/admin` (meQuery) lẫn 403 của NestJS.
 */
export const ROLE_COOKIE = "ap_role";
export const ADMIN_ROLE = "ADMIN";

/** Dùng khi không đọc được `exp` của access token — khớp AUTH_ACCESS_TOKEN_TTL_SECONDS (900) của server. */
export const ACCESS_TOKEN_FALLBACK_MAX_AGE = 15 * 60;

export const LOGIN_PATH = ROUTES.auth.login;
export const HOME_PATH = ROUTES.home;
/** Khu vực chỉ dành cho ADMIN; ADMIN không vào được trang nào ngoài khu này, trừ ADMIN_FRONT_PATHS. */
export const ADMIN_PATH = ROUTES.admin.root;
/** Trang front ADMIN vẫn vào được (khớp đúng path, không gồm trang con) — trang chủ (Specs/19102026/admin.md). */
export const ADMIN_FRONT_PATHS: readonly string[] = [ROUTES.home];
export const ADMIN_HOME_PATH = ROUTES.admin.articles.list();
export const LOGIN_NEXT_PARAM = "next";
/**
 * Làm mới phiên rồi quay lại `?next=` (GET, route BFF) — proxy dùng cho trang render cần token
 * (khu quản trị) khi chỉ còn cookie refresh.
 */
export const REFRESH_PATH = "/api/auth/refresh";
export const REFRESH_NEXT_PARAM = "next";

/** Đã đăng nhập mà vào các trang này → về HOME_PATH. */
export const GUEST_ONLY_PATHS: readonly string[] = [
  ROUTES.auth.login,
  ROUTES.auth.register,
  ROUTES.auth.activate,
  ROUTES.auth.resetPassword,
  ROUTES.auth.changePassword,
];

/** Chưa đăng nhập mà vào các trang này (và trang con) → về LOGIN_PATH (kèm `next` để quay lại). */
export const PROTECTED_PATHS: readonly string[] = [ROUTES.myProfile, ROUTES.diagnosis.list, ROUTES.admin.root];
