import { NextResponse, type NextRequest } from "next/server";
import {
  clearAuthCookies,
  createNestClient,
  forbiddenOriginResponse,
  getAccessToken,
  getRefreshToken,
  isSameOrigin,
  refreshTokens,
} from "@/shared/lib/auth";
import { isAppError } from "@/shared/lib/http";

/** Thu hồi phiên ở NestJS (best effort) rồi xóa cookie. Luôn trả 204. */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return forbiddenOriginResponse();

  const refreshToken = await getRefreshToken();
  if (refreshToken) {
    try {
      await createNestClient(await getAccessToken()).post("/auth/logout", { refreshToken });
    } catch (error) {
      // Logout cần Bearer: access token hết hạn → refresh rồi thử lại một lần để phiên thật sự bị thu hồi.
      if (isAppError(error) && error.status === 401) {
        const pair = await refreshTokens().catch(() => null);
        if (pair) {
          await createNestClient(pair.accessToken)
            .post("/auth/logout", { refreshToken: pair.refreshToken })
            .catch(() => undefined);
        }
      }
    }
  }

  await clearAuthCookies();
  return new NextResponse(null, { status: 204 });
}
