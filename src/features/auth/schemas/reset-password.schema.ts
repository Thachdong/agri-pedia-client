import { rules, schema, v } from "@/shared/lib/validation";
import { LOGIN_TYPES } from "../constants/auth.constants";
import type { TRequestPasswordResetInput } from "../types/auth.types";

/** Mirror RequestPasswordResetDto (identifier ≤ 255) — client chặt hơn: identifier đúng định dạng theo loginType. */
export const resetPasswordSchema = schema<TRequestPasswordResetInput>({
  loginType: v.string().valid(...LOGIN_TYPES).required(),
  identifier: v.when("loginType", {
    is: "PHONE",
    then: rules.phone().required(),
    otherwise: rules.email().required(),
  }),
});
