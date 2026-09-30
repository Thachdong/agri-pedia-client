import { useAppMutation } from "@/shared/lib/query";
import { register } from "../services/auth.service";
import type { TRegisterInput } from "../types/auth.types";

/** Chưa đăng nhập, chưa có query nào phụ thuộc user mới → không invalidate. */
export const useRegister = () =>
  useAppMutation({
    mutationFn: (input: TRegisterInput) => register(input),
    invalidates: () => [],
  });
