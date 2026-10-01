import type { IHttpClient } from "@/shared/lib/http";
import { appInfiniteQueryOptions, queryKeys } from "@/shared/lib/query";
import { getDistributorProducts } from "../services/product.service";

export const DISTRIBUTOR_PRODUCTS_PAGE_SIZE = 20;

/** Product ACTIVE của 1 distributor, mới nhất trước, phân trang cursor (`nextCursor` null = hết). */
export const distributorProductsQuery = (distributorId: string, client?: IHttpClient) =>
  appInfiniteQueryOptions({
    queryKey: queryKeys.products.list(distributorId),
    queryFn: ({ pageParam }) =>
      getDistributorProducts(distributorId, { cursor: pageParam, limit: DISTRIBUTOR_PRODUCTS_PAGE_SIZE }, client),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
