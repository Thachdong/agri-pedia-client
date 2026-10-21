import type { IHttpClient } from "@/shared/lib/http";
import { appInfiniteQueryOptions, appQueryOptions, queryKeys } from "@/shared/lib/query";
import { ARTICLE_LIST_PAGE_SIZE } from "../constants/article.constants";
import { listAllCropArticles, listArticleCrops, listArticles } from "../services/article.service";
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

/** Cây có bài viết (code ↔ slug) — client tra slug từ `cropType` của chẩn đoán. */
export const articleCropsQuery = (client?: IHttpClient) =>
  appQueryOptions({
    queryKey: queryKeys.articles.crops(),
    queryFn: ({ signal }) => listArticleCrops(client, { signal }),
    staleTime: 30 * 60_000,
  });

/** Toàn bộ bài của 1 cây (mọi trang) — tra theo diseaseCode. */
export const cropArticleIndexQuery = (cropSlug: string, client?: IHttpClient) =>
  appQueryOptions({
    queryKey: queryKeys.articles.cropIndex(cropSlug),
    queryFn: ({ signal }) => listAllCropArticles(cropSlug, client, { signal }),
    staleTime: 30 * 60_000,
  });
