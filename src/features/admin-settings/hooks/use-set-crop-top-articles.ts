import { queryKeys, useAppMutation } from "@/shared/lib/query";
import { setCropTopArticles } from "../services/admin-settings.service";
import type { TSetCropTopArticlesInput } from "../types/admin-settings.types";

/** Lưu bài nổi bật của cây `cropSlug`. Trang public cập nhật qua revalidate của server (ISR), không qua cache client. */
export const useSetCropTopArticles = (cropSlug: string) =>
  useAppMutation({
    meta: { silent: true },
    mutationFn: (input: TSetCropTopArticlesInput) => setCropTopArticles(cropSlug, input),
    invalidates: () => [queryKeys.adminSettings.topArticles(cropSlug)],
  });
