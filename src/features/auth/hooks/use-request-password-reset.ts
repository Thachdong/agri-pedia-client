import { useAppMutation } from "@/shared/lib/query";
import { requestPasswordReset } from "../services/auth.service";
import type { TRequestPasswordResetInput } from "../types/auth.types";

/** Chưa đăng nhập, chỉ gửi code → không query nào cũ đi, không invalidate. */
export const useRequestPasswordReset = () =>
  useAppMutation({
    mutationFn: (input: TRequestPasswordResetInput) => requestPasswordReset(input),
    // Form tự hiển thị lỗi (field / root), OTP_ALREADY_REQUESTED được coi là thành công → không báo lỗi global.
    meta: { silent: true },
    invalidates: () => [],
  });
