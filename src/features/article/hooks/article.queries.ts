import type { IHttpClient } from "@/shared/lib/http";
import { appInfiniteQueryOptions, appQueryOptions, queryKeys } from "@/shared/lib/query";
import { ARTICLE_LIST_PAGE_SIZE, DISEASE_ARTICLES_PAGE_SIZE } from "../constants/article.constants";
import { listArticleCrops, listArticles } from "../services/article.service";
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

/** Bài về các bệnh `diseaseCodes` (≤ 50) của 1 cây — 1 trang (bài chính + variant, theo tiêu đề). */
export const diseaseArticlesQuery = (cropSlug: string, diseaseCodes: string[], client?: IHttpClient) =>
  appQueryOptions({
    queryKey: queryKeys.articles.byDiseases(cropSlug, diseaseCodes),
    queryFn: ({ signal }) =>
      listArticles({ crop: cropSlug, diseaseCodes, limit: DISEASE_ARTICLES_PAGE_SIZE }, client, { signal }).then(
        ({ articles }) => articles,
      ),
    staleTime: 30 * 60_000,
  });
