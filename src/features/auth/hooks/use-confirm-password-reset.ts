import { useAppMutation } from "@/shared/lib/query";
import { confirmPasswordReset } from "../services/auth.service";
import type { TConfirmPasswordResetInput } from "../types/auth.types";

/** Chưa đăng nhập (trang guest-only), không query nào phụ thuộc mật khẩu → không invalidate. */
export const useConfirmPasswordReset = () =>
  useAppMutation({
    mutationFn: (input: TConfirmPasswordResetInput) => confirmPasswordReset(input),
    // Form tự hiển thị lỗi (field / root) → không báo lỗi global.
    meta: { silent: true },
    invalidates: () => [],
  });
