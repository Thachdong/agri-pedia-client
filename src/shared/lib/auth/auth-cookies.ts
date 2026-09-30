import "server-only";
import { cookies } from "next/headers";
import { publicEnv } from "@/shared/config";
import { serverEnv } from "@/shared/config/env.server";
import { ACCESS_TOKEN_COOKIE, ACCESS_TOKEN_FALLBACK_MAX_AGE, REFRESH_TOKEN_COOKIE } from "./auth.constants";

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

export async function setAuthCookies({ accessToken, refreshToken }: TTokenPair): Promise<void> {
  const store = await cookies();
  store.set(ACCESS_TOKEN_COOKIE, accessToken, { ...cookieOptions(), maxAge: secondsUntilExpiry(accessToken) });
  store.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...cookieOptions(),
    maxAge: serverEnv.AUTH_REFRESH_TOKEN_TTL_SECONDS,
  });
}

export async function clearAuthCookies(): Promise<void> {
  const store = await cookies();
  store.delete({ name: ACCESS_TOKEN_COOKIE, path: "/" });
  store.delete({ name: REFRESH_TOKEN_COOKIE, path: "/" });
}

export async function getAccessToken(): Promise<string | undefined> {
  return (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  return (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value;
}
