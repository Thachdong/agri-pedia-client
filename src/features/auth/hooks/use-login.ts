import { queryKeys, useAppMutation } from "@/shared/lib/query";
import { login } from "../services/auth.service";
import type { TLoginInput } from "../types/auth.types";

/** Đổi phiên → dữ liệu public (vd. distributor gần tôi theo địa chỉ chính) đổi theo → invalidate toàn bộ cache. */
export const useLogin = () =>
  useAppMutation({
    mutationFn: (input: TLoginInput) => login(input),
    // Form tự hiển thị lỗi (field / root) → không báo lỗi global.
    meta: { silent: true },
    invalidates: () => [queryKeys.all],
  });
