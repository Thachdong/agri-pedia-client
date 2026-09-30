import type { TRegisterFormValues, TRegisterInput } from "../types/auth.types";

/** Chỉ gửi field của RegisterUserDto — bỏ `confirmPassword` (client-only). */
export const toRegisterInput = ({
  loginType,
  identifier,
  password,
  username,
  role,
  bussinessType,
  bio,
  address,
}: TRegisterFormValues): TRegisterInput => ({
  loginType,
  identifier,
  password,
  username,
  role,
  bussinessType,
  bio,
  address,
});
