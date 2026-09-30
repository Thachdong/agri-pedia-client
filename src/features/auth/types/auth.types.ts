import type { TApiSchema } from "@/shared/lib/http";

export type TRegisterInput = TApiSchema<"RegisterUserDto">;
export type TRegisterAddressInput = TApiSchema<"RegisterAddressDto">;
export type TActivateInput = TApiSchema<"ActivateAccountDto">;
export type TResendCodeInput = TApiSchema<"ResendCodeDto">;
export type TLoginInput = TApiSchema<"LoginUserDto">;
export type TRequestPasswordResetInput = TApiSchema<"RequestPasswordResetDto">;
export type TConfirmPasswordResetInput = TApiSchema<"ConfirmPasswordResetDto">;
/** Profile trả về khi đăng nhập — token nằm ở cookie httpOnly (BFF), browser không thấy. */
export type TLoginUser = TApiSchema<"UserProfileResponse">;
/** Loại code: ACTIVATE_DISTRIBUTOR (gửi lúc đăng ký) | RESET_PASSWORD. */
export type TOtpPurpose = TResendCodeInput["purpose"];
export type TLoginType = TRegisterInput["loginType"];
export type TUserRole = TRegisterInput["role"];
export type TBusinessType = NonNullable<TRegisterInput["bussinessType"]>;

/** Giá trị form đăng ký — thêm `confirmPassword` (chỉ client, không gửi API). */
export type TRegisterFormValues = TRegisterInput & { confirmPassword: string };

/** Giá trị form kích hoạt — thêm `loginType` (chỉ để chọn rule identifier, không gửi API). */
export type TActivateFormValues = TActivateInput & { loginType: TLoginType };

/** Giá trị form đổi mật khẩu bằng code — thêm `loginType` (chọn rule identifier) và `confirmPassword`; cả 2 chỉ client, không gửi API. */
export type TChangePasswordFormValues = TConfirmPasswordResetInput & { loginType: TLoginType; confirmPassword: string };

/** Luồng có chuyển dữ liệu sang trang kế tiếp qua sessionStorage. */
export type TAuthHandoffFlow = "register" | "reset-password" | "login";

/**
 * register → /auth/activate; reset-password → /auth/change-password: `at` = epoch ms lúc gửi code.
 * login → /auth/login (sau đăng ký FARMER / kích hoạt thành công): chỉ để điền sẵn, `at` không dùng.
 */
export type TAuthHandoff = { loginType: TLoginType; identifier: string; at: number };
