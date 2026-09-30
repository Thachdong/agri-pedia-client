import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { APP_ERROR_CODE, isAppError } from "@/shared/lib/http";

/** CSRF: request thay đổi dữ liệu phải có Origin trùng origin của app. */
export function isSameOrigin(request: NextRequest): boolean {
  return request.headers.get("origin") === request.nextUrl.origin;
}

export function forbiddenOriginResponse(): NextResponse {
  return NextResponse.json({ statusCode: 403, code: "FORBIDDEN_ORIGIN", message: "Origin không hợp lệ" }, { status: 403 });
}

export function sessionExpiredResponse(): NextResponse {
  return NextResponse.json(
    { statusCode: 401, code: APP_ERROR_CODE.SESSION_EXPIRED, message: "Phiên đăng nhập đã hết hạn" },
    { status: 401 },
  );
}

/** Trả lỗi NestJS về browser giữ nguyên shape (DomainErrorResponse / ValidationErrorResponse). */
export function toErrorResponse(error: unknown): NextResponse {
  if (!isAppError(error) || error.status === 0) {
    return NextResponse.json(
      { statusCode: 502, code: "UPSTREAM_UNAVAILABLE", message: "Không thể kết nối máy chủ" },
      { status: 502 },
    );
  }
  if (error.code === APP_ERROR_CODE.VALIDATION_ERROR) {
    return NextResponse.json(
      { statusCode: error.status, message: error.details, error: "Bad Request" },
      { status: error.status },
    );
  }
  return NextResponse.json(
    { statusCode: error.status, code: error.code, message: error.message, details: error.details },
    { status: error.status },
  );
}
