import { http, type IHttpClient } from "@/shared/lib/http";
import type {
  TActivateInput,
  TConfirmPasswordResetInput,
  TLoginInput,
  TLoginUser,
  TRegisterInput,
  TRequestPasswordResetInput,
  TResendCodeInput,
} from "../types/auth.types";

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

/** 200, body rỗng — gửi code RESET_PASSWORD; code cũ còn hạn → 409 OTP_ALREADY_REQUESTED (details.issuedAt). */
export const requestPasswordReset = (input: TRequestPasswordResetInput, client: IHttpClient = http) =>
  client.post<void, TRequestPasswordResetInput>("/auth/reset-password", input);

/** 200, body rỗng — đặt mật khẩu mới bằng code RESET_PASSWORD; server thu hồi mọi phiên của user. */
export const confirmPasswordReset = (input: TConfirmPasswordResetInput, client: IHttpClient = http) =>
  client.post<void, TConfirmPasswordResetInput>("/auth/reset-password/confirm", input);
