import { http, type IHttpClient } from "@/shared/lib/http";
import type { TActivateInput, TLoginInput, TLoginUser, TRegisterInput, TResendCodeInput } from "../types/auth.types";

/** 201, body rỗng. */
export const register = (input: TRegisterInput, client: IHttpClient = http) =>
  client.post<void, TRegisterInput>("/auth/register", input);

/** 200, body rỗng — account DISTRIBUTOR chuyển sang ACTIVE. */
export const activate = (input: TActivateInput, client: IHttpClient = http) =>
  client.post<void, TActivateInput>("/auth/activate", input);

/** 200, body rỗng — gửi lại code theo `purpose` (code hết hạn → server tạo code mới). */
export const resendCode = (input: TResendCodeInput, client: IHttpClient = http) =>
  client.post<void, TResendCodeInput>("/auth/resend", input);

/** Gọi BFF route `/api/auth/login` (không phải catch-all): BFF ghi token vào cookie httpOnly, chỉ trả profile. */
export const login = (input: TLoginInput, client: IHttpClient = http) =>
  client.post<{ user: TLoginUser }, TLoginInput>("/auth/login", input);
