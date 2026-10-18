import "server-only";
import { cookies } from "next/headers";
import { publicEnv } from "@/shared/config";
import { serverEnv } from "@/shared/config/env.server";
import { ACCESS_TOKEN_COOKIE, ACCESS_TOKEN_FALLBACK_MAX_AGE, REFRESH_TOKEN_COOKIE, ROLE_COOKIE } from "./auth.constants";

export type TTokenPair = { accessToken: string; refreshToken: string };

/** Số giây còn lại tới `exp` của JWT (chỉ đọc payload để đặt maxAge, không verify). */
function secondsUntilExpiry(jwt: string): number {
  try {
    const payload = JSON.parse(Buffer.from(jwt.split(".")[1] ?? "", "base64url").toString("utf8")) as { exp?: unknown };
    if (typeof payload.exp === "number") return Math.max(0, payload.exp - Math.floor(Date.now() / 1000));
  } catch {
    // Token không phải JWT hợp lệ → dùng fallback.
  }
  return ACCESS_TOKEN_FALLBACK_MAX_AGE;
}

const cookieOptions = () => ({
  httpOnly: true,
  secure: publicEnv.isProd,
  sameSite: "lax" as const,
  path: "/",
});

/**
 * Ghi cặp token + cookie role (cùng tuổi với refresh). Không truyền `role` (refresh) → giữ role cũ, gia hạn theo refresh.
 */
export async function setAuthCookies({ accessToken, refreshToken }: TTokenPair, role?: string): Promise<void> {
  const store = await cookies();
  const sessionMaxAge = serverEnv.AUTH_REFRESH_TOKEN_TTL_SECONDS;
  store.set(ACCESS_TOKEN_COOKIE, accessToken, { ...cookieOptions(), maxAge: secondsUntilExpiry(accessToken) });
  store.set(REFRESH_TOKEN_COOKIE, refreshToken, { ...cookieOptions(), maxAge: sessionMaxAge });

  const nextRole = role ?? store.get(ROLE_COOKIE)?.value;
  if (nextRole) store.set(ROLE_COOKIE, nextRole, { ...cookieOptions(), maxAge: sessionMaxAge });
}

export async function clearAuthCookies(): Promise<void> {
  const store = await cookies();
  store.delete({ name: ACCESS_TOKEN_COOKIE, path: "/" });
  store.delete({ name: REFRESH_TOKEN_COOKIE, path: "/" });
  store.delete({ name: ROLE_COOKIE, path: "/" });
}

export async function getAccessToken(): Promise<string | undefined> {
  return (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  return (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value;
}

/**
 * Có phiên đăng nhập = còn cookie access hoặc refresh (cùng quy tắc với `src/proxy.ts`).
 * Chỉ đọc cookie, không verify token — access hết hạn sẽ được BFF refresh khi gọi API.
 * Dùng ở Server Component để rẽ nhánh UI guest / đã đăng nhập (làm route thành dynamic).
 */
export async function hasSession(): Promise<boolean> {
  const store = await cookies();
  return store.has(ACCESS_TOKEN_COOKIE) || store.has(REFRESH_TOKEN_COOKIE);
}
