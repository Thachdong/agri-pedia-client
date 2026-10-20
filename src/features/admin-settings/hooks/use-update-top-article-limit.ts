import { queryKeys, useAppMutation } from "@/shared/lib/query";
import { updateTopArticleSettings } from "../services/admin-settings.service";
import type { TUpdateTopArticleSettingsInput } from "../types/admin-settings.types";

/** Lưu số bài nổi bật mỗi cây — danh sách của mọi cây trả kèm `limit` nên cũng stale. */
export const useUpdateTopArticleLimit = () =>
  useAppMutation({
    meta: { silent: true },
    mutationFn: (input: TUpdateTopArticleSettingsInput) => updateTopArticleSettings(input),
    invalidates: () => [queryKeys.adminSettings.topArticleLimit(), queryKeys.adminSettings.topArticleLists()],
  });
