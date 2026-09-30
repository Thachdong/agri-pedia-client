import type { TApiSchema } from "@/shared/lib/http";

export type TRegisterInput = TApiSchema<"RegisterUserDto">;
export type TRegisterAddressInput = TApiSchema<"RegisterAddressDto">;
export type TActivateInput = TApiSchema<"ActivateAccountDto">;
export type TResendCodeInput = TApiSchema<"ResendCodeDto">;
/** Loại code: ACTIVATE_DISTRIBUTOR (gửi lúc đăng ký) | RESET_PASSWORD. */
export type TOtpPurpose = TResendCodeInput["purpose"];
export type TLoginType = TRegisterInput["loginType"];
export type TUserRole = TRegisterInput["role"];
export type TBusinessType = NonNullable<TRegisterInput["bussinessType"]>;

/** Giá trị form đăng ký — thêm `confirmPassword` (chỉ client, không gửi API). */
export type TRegisterFormValues = TRegisterInput & { confirmPassword: string };

/** Giá trị form kích hoạt — thêm `loginType` (chỉ để chọn rule identifier, không gửi API). */
export type TActivateFormValues = TActivateInput & { loginType: TLoginType };

/** Luồng có chuyển dữ liệu sang trang kế tiếp qua sessionStorage. */
export type TAuthHandoffFlow = "register" | "reset-password";

/** register → /auth/activate; reset-password → /auth/change-password. `at` = epoch ms lúc gửi code. */
export type TAuthHandoff = { loginType: TLoginType; identifier: string; at: number };
