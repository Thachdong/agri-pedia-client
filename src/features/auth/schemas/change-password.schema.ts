import { rules, schema, v } from "@/shared/lib/validation";
import { LOGIN_TYPES, OTP_CODE_LENGTH } from "../constants/auth.constants";
import type { TChangePasswordFormValues } from "../types/auth.types";

/**
 * Mirror ConfirmPasswordResetDto (identifier ≤ 255, code 4..10 chữ số, newPassword 8..128).
 * Client chặt hơn: identifier đúng định dạng theo loginType, code đúng OTP_CODE_LENGTH chữ số; confirmPassword chỉ ở client.
 */
export const changePasswordSchema = schema<TChangePasswordFormValues>({
  loginType: v.string().valid(...LOGIN_TYPES).required(),
  identifier: v.when("loginType", {
    is: "PHONE",
    then: rules.phone().required(),
    otherwise: rules.email().required(),
  }),
  newPassword: rules.password().required(),
  confirmPassword: v
    .string()
    .valid(v.ref("newPassword"))
    .required()
    .messages({ "any.only": "Mật khẩu xác nhận không khớp" }),
  code: rules.otpCode(OTP_CODE_LENGTH).required(),
});
