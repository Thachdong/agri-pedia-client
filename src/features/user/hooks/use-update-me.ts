import { queryKeys, useAppMutation } from "@/shared/lib/query";
import { updateMe } from "../services/user.service";
import type { TUpdateProfileInput } from "../types/user.types";

/**
 * Cập nhật hồ sơ người đang đăng nhập. `userId` = id của chính họ — để làm stale profile public
 * (trang /profile/<id>) cùng với /users/me.
 */
export const useUpdateMe = (userId: string) =>
  useAppMutation({
    mutationFn: (input: TUpdateProfileInput) => updateMe(input),
    invalidates: () => [queryKeys.users.me(), queryKeys.distributors.detail(userId)],
  });
