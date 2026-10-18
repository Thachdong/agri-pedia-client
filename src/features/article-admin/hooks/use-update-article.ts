import { queryKeys, useAppMutation } from "@/shared/lib/query";
import { updateArticle } from "../services/article-admin.service";
import type { TUpdateArticleInput } from "../types/article-admin.types";

/** Sửa bài `code` của cây `cropSlug` — nội dung bài và dòng của nó trong bảng (origin, ngày cập nhật) bị stale. */
export const useUpdateArticle = (code: string, cropSlug: string) =>
  useAppMutation({
    mutationFn: (input: TUpdateArticleInput) => updateArticle(code, input),
    invalidates: () => [queryKeys.adminArticles.detail(code), queryKeys.adminArticles.targets(cropSlug)],
  });
