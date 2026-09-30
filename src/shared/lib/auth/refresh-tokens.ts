import "server-only";
import { isAppError, type TApiSchema } from "@/shared/lib/http";
import { clearAuthCookies, getRefreshToken, setAuthCookies, type TTokenPair } from "./auth-cookies";
import { createNestClient } from "./nest-client";

/**
 * Đổi refresh token (cookie) lấy cặp token mới và ghi lại cookie.
 * Trả về null khi không có / hết hạn / bị thu hồi (cookie bị xóa). Lỗi mạng / 5xx được throw.
 * Server xoay vòng refresh token nhưng có grace period, nên các request song song cùng refresh vẫn thành công.
 */
export async function refreshTokens(): Promise<TTokenPair | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    const pair = await createNestClient().post<TApiSchema<"RefreshAccessTokenResponse">>("/auth/refresh-token", {
      refreshToken,
    });
    await setAuthCookies(pair);
    return pair;
  } catch (error) {
    if (isAppError(error) && error.status >= 400 && error.status < 500) {
      await clearAuthCookies();
      return null;
    }
    throw error;
  }
}
