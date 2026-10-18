import { queryKeys, useAppMutation } from "@/shared/lib/query";
import { setArticlePublished } from "../services/article-admin.service";
import type { TSetArticlePublishedInput } from "../types/article-admin.types";

/** Publish / unpublish 1 bài của cây `cropSlug` — bài, bảng của cây và số bài published của cây bị stale. */
export const useSetArticlePublished = (cropSlug: string) =>
  useAppMutation({
    mutationFn: ({ code, published }: TSetArticlePublishedInput) => setArticlePublished(code, published),
    invalidates: ({ code }) => [
      queryKeys.adminArticles.detail(code),
      queryKeys.adminArticles.targets(cropSlug),
      queryKeys.adminArticles.crops(),
    ],
  });
