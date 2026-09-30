import { rules, schema, v } from "@/shared/lib/validation";
import type { TRegisterFormValues } from "../types/auth.types";

const LOGIN_TYPES = ["EMAIL", "PHONE"] as const;
const ROLES = ["FARMER", "DISTRIBUTOR"] as const;
const BUSINESS_TYPES = ["AGRICULTURAL_CHEMICAL_SUPPLIES", "SEEDS_SEEDLINGS", "AQUACULTURE_SEEDLINGS"] as const;

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
  address: v
    .object({
      province: v.string().max(255).required().messages(selectRequired("Vui lòng chọn tỉnh/thành phố")),
      ward: v.string().max(255).required().messages(selectRequired("Vui lòng chọn phường/xã")),
      houseNumber: v.string().trim().max(255).required(),
      lat: v.number().min(-90).max(90).required().messages({ "any.required": "Vui lòng chọn vị trí trên bản đồ" }),
      long: v.number().min(-180).max(180).required().messages({ "any.required": "Vui lòng chọn vị trí trên bản đồ" }),
    })
    .required(),
});
