import { NextResponse } from "next/server";
import { hasSession } from "@/shared/lib/auth";

/**
 * Browser biết có phiên hay không mà không gọi NestJS — cho trang public ISR (không được đọc cookie lúc render).
 * Chỉ kiểm tra cookie tồn tại; token hết hạn được BFF forward refresh khi gọi API thật. Không bao giờ trả token.
 */
export async function GET() {
  return NextResponse.json(
    { signedIn: await hasSession() },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
