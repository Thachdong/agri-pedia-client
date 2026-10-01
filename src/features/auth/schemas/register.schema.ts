import { BUSINESS_TYPE_OPTIONS } from "@/shared/constants";
import { rules, schema, v } from "@/shared/lib/validation";
import { LOGIN_TYPES, ROLE_OPTIONS } from "../constants/auth.constants";
import type { TRegisterFormValues } from "../types/auth.types";

const ROLES = ROLE_OPTIONS.map((option) => option.value);
const BUSINESS_TYPES = BUSINESS_TYPE_OPTIONS.map((option) => option.value);

const selectRequired = (message: string) => ({ "any.required": message, "string.empty": message });

/** Mirror RegisterUserDto + rule nghiệp vụ của action 1 (specs/api.md). */
export const registerSchema = schema<TRegisterFormValues>({
  loginType: v.string().valid(...LOGIN_TYPES).required(),
  identifier: v.when("loginType", {
    is: "PHONE",
    then: rules.phone().required(),
    otherwise: rules.email().required(),
  }),
  password: rules.password().required(),
  confirmPassword: v
    .string()
    .valid(v.ref("password"))
    .required()
    .messages({ "any.only": "Mật khẩu xác nhận không khớp" }),
  username: rules.username().empty("").optional(),
  role: v.string().valid(...ROLES).required(),
  // Bắt buộc với DISTRIBUTOR; FARMER luôn gửi null (kể cả khi đã chọn trước lúc đổi role).
  bussinessType: v.when("role", {
    is: "DISTRIBUTOR",
    then: v
      .string()
      .valid(...BUSINESS_TYPES)
      .empty(null)
      .required()
      .messages(selectRequired("Vui lòng chọn loại hình kinh doanh")),
    otherwise: v.any().empty(v.any()).default(null),
  }),
  bio: v.string().trim().max(1000).empty("").optional(),
  address: v.object(rules.addressFields()).required(),
});
