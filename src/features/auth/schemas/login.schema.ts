import { rules, schema, v } from "@/shared/lib/validation";
import { LOGIN_TYPES } from "../constants/auth.constants";
import type { TLoginInput } from "../types/auth.types";

/**
 * Mirror LoginUserDto (identifier 1..255, password 1..128) — client chặt hơn: identifier đúng định dạng theo loginType.
 * Password không trim, không áp rule độ mạnh (min 8): account cũ vẫn đăng nhập được, server tự trả USER_INVALID_CREDENTIALS.
 */
export const loginSchema = schema<TLoginInput>({
  loginType: v.string().valid(...LOGIN_TYPES).required(),
  identifier: v.when("loginType", {
    is: "PHONE",
    then: rules.phone().required(),
    otherwise: rules.email().required(),
  }),
  password: v.string().max(128).required(),
});
