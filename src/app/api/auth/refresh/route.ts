import { NextResponse, type NextRequest } from "next/server";
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
