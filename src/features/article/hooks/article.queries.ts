import type { IHttpClient } from "@/shared/lib/http";
import { appInfiniteQueryOptions, queryKeys } from "@/shared/lib/query";
import { ARTICLE_LIST_PAGE_SIZE } from "../constants/article.constants";
import { listArticles } from "../services/article.service";
import type { TArticleListFilters } from "../types/article.types";

/** Bài của 1 cây theo tiêu đề, phân trang cursor (`nextCursor` null = hết). Bài hiếm đổi → stale lâu. */
export const articleListQuery = (filters: TArticleListFilters, client?: IHttpClient) =>
  appInfiniteQueryOptions({
    queryKey: queryKeys.articles.list(filters),
    queryFn: ({ pageParam, signal }) =>
      listArticles({ ...filters, cursor: pageParam, limit: ARTICLE_LIST_PAGE_SIZE }, client, { signal }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 30 * 60_000,
  });
