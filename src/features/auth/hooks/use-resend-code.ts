import { useAppMutation } from "@/shared/lib/query";
import { resendCode } from "../services/auth.service";
import type { TOtpPurpose, TResendCodeInput } from "../types/auth.types";

/**
 * `purpose` cố định theo trang (activate → ACTIVATE_DISTRIBUTOR, change-password → RESET_PASSWORD).
 * Gửi lại code không làm dữ liệu query nào cũ đi → không invalidate.
 */
export const useResendCode = (purpose: TOtpPurpose) =>
  useAppMutation({
    mutationFn: ({ identifier }: Pick<TResendCodeInput, "identifier">) => resendCode({ identifier, purpose }),
    // Form tự hiển thị lỗi (field / root) → không báo lỗi global.
    meta: { silent: true },
    invalidates: () => [],
  });
