import { useAppMutation } from "@/shared/lib/query";
import { activate } from "../services/auth.service";
import type { TActivateInput } from "../types/auth.types";

/** Chưa đăng nhập, chưa có query nào phụ thuộc trạng thái account → không invalidate. */
export const useActivate = () =>
  useAppMutation({
    mutationFn: (input: TActivateInput) => activate(input),
    // Form tự hiển thị lỗi (field / root) → không báo lỗi global.
    meta: { silent: true },
    invalidates: () => [],
  });
