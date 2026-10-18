import { ROUTES } from "@/shared/constants";
import type { TLoginUser } from "../types/auth.types";

/** Origin giả chỉ để parse — path hợp lệ phải giữ nguyên origin này sau khi resolve. */
const PARSE_ORIGIN = "http://agripedia.local";
/** BFF route, không phải trang. */
const BLOCKED_PREFIXES = ["/api"] as const;

/**
 * Chống open redirect cho `?next=` sau đăng nhập: chỉ nhận path nội bộ ("/..."),
 * chặn "//evil.com", "/\evil.com", "http:...", ký tự điều khiển và route BFF. Không hợp lệ → trang chủ.
 */
export const getSafeNextPath = (value: unknown, fallback: string = ROUTES.home): string => {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return fallback;
  // Browser coi "\" như "/" và bỏ qua tab/xuống dòng → "/\evil.com" thành "//evil.com".
  if (/[\\\u0000-\u001f\u007f]/.test(value)) return fallback;

  let url: URL;
  try {
    url = new URL(value, PARSE_ORIGIN);
  } catch {
    return fallback;
  }
  if (url.origin !== PARSE_ORIGIN) return fallback;

  const { pathname } = url;
  if (BLOCKED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) return fallback;

  return `${pathname}${url.search}${url.hash}`;
};

const isAdminPath = (path: string) => path === ROUTES.admin.root || path.startsWith(`${ROUTES.admin.root}/`);

const roleHomePath = ({ id, role }: Pick<TLoginUser, "id" | "role">): string => {
  if (role === "ADMIN") return ROUTES.admin.articles.list();
  if (role === "DISTRIBUTOR") return ROUTES.profile(id);
  return ROUTES.home;
};

/**
 * Đích sau khi đăng nhập: `?next=` an toàn được ưu tiên (quay lại trang đang mở trước khi bị đẩy về login)
 * nếu cùng khu với role (ADMIN chỉ khu `/admin`, role khác chỉ ngoài khu đó);
 * không có / không hợp lệ → theo role: ADMIN → quản lý bài viết, DISTRIBUTOR → profile của mình, FARMER → trang chủ.
 */
export const getPostLoginPath = (user: Pick<TLoginUser, "id" | "role">, next?: unknown): string => {
  const fallback = roleHomePath(user);
  const path = getSafeNextPath(next, fallback);
  return isAdminPath(path) === (user.role === "ADMIN") ? path : fallback;
};
