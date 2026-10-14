import { NextResponse, type NextRequest } from "next/server";
import {
  createNestClient,
  forbiddenOriginResponse,
  isSameOrigin,
  setAuthCookies,
  toErrorResponse,
} from "@/shared/lib/auth";
import type { TApiSchema } from "@/shared/lib/http";

type TLoginBffResponse = { user: TApiSchema<"LoginUserResponse">["user"] };

/** Đăng nhập: NestJS trả token → ghi cookie httpOnly; browser chỉ nhận profile, không nhận token. */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return forbiddenOriginResponse();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ statusCode: 400, message: ["Body phải là JSON"], error: "Bad Request" }, { status: 400 });
  }

  try {
    const { accessToken, refreshToken, user } = await createNestClient().post<TApiSchema<"LoginUserResponse">>(
      "/auth/login",
      body,
    );
    await setAuthCookies({ accessToken, refreshToken });
    return NextResponse.json<TLoginBffResponse>({ user });
  } catch (error) {
    return toErrorResponse(error);
  }
}
