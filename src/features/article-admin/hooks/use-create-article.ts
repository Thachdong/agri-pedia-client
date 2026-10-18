import { queryKeys, useAppMutation } from "@/shared/lib/query";
import { createArticle } from "../services/article-admin.service";
import type { TCreateArticleInput } from "../types/article-admin.types";

/** Viết bài mới cho 1 bệnh của cây `cropSlug` — bảng của cây đó và số bài của các cây bị stale. */
export const useCreateArticle = (cropSlug: string) =>
  useAppMutation({
    mutationFn: (input: TCreateArticleInput) => createArticle(input),
    invalidates: (_input, { code }) => [
      queryKeys.adminArticles.crops(),
      queryKeys.adminArticles.targets(cropSlug),
      queryKeys.adminArticles.detail(code),
    ],
  });
