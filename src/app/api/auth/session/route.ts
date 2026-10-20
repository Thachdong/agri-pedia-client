import { NextResponse } from "next/server";
import { hasAdminSession, hasSession } from "@/shared/lib/auth";

/**
 * Browser biết có phiên hay không mà không gọi NestJS — cho trang public ISR (không được đọc cookie lúc render).
 * Chỉ kiểm tra cookie tồn tại; token hết hạn được BFF forward refresh khi gọi API thật. Không bao giờ trả token.
 * `isAdmin` từ cookie role — chỉ để chọn header (ADMIN không có chat / thông báo), không phải quyền.
 */
export async function GET() {
  return NextResponse.json(
    { signedIn: await hasSession(), isAdmin: await hasAdminSession() },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
