import type { TApiSchema } from "@/shared/lib/http";

export type TRegisterInput = TApiSchema<"RegisterUserDto">;
export type TRegisterAddressInput = TApiSchema<"RegisterAddressDto">;
export type TLoginType = TRegisterInput["loginType"];
export type TUserRole = TRegisterInput["role"];
export type TBusinessType = NonNullable<TRegisterInput["bussinessType"]>;

/** Giá trị form đăng ký — thêm `confirmPassword` (chỉ client, không gửi API). */
export type TRegisterFormValues = TRegisterInput & { confirmPassword: string };

/** Luồng có chuyển dữ liệu sang trang kế tiếp qua sessionStorage. */
export type TAuthHandoffFlow = "register" | "reset-password";

/** register → /auth/activate; reset-password → /auth/change-password. `at` = epoch ms lúc gửi code. */
export type TAuthHandoff = { loginType: TLoginType; identifier: string; at: number };
