import { queryKeys, useAppMutation } from "@/shared/lib/query";
import { updateProductSuggestionAiModel } from "../services/admin-settings.service";
import type { TUpdateProductSuggestionAiModelInput } from "../types/admin-settings.types";

/** Lưu AI model đọc tên sản phẩm — chỉ bản admin bị stale. */
export const useUpdateProductSuggestionAiModel = () =>
  useAppMutation({
    // Lỗi hiện ngay trên form.
    meta: { silent: true },
    mutationFn: (input: TUpdateProductSuggestionAiModelInput) => updateProductSuggestionAiModel(input),
    invalidates: () => [queryKeys.adminSettings.productSuggestionAiModel()],
  });
