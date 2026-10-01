import type { IHttpClient } from "@/shared/lib/http";
import { appInfiniteQueryOptions, appQueryOptions, queryKeys } from "@/shared/lib/query";
import { getCategories, getDistributorProducts, getProductDetail } from "../services/product.service";

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

/** Chi tiết product (M3) — dialog chi tiết và form sửa (M9) dùng chung. */
export const productDetailQuery = (productId: string, client?: IHttpClient) =>
  appQueryOptions({
    queryKey: queryKeys.products.detail(productId),
    queryFn: () => getProductDetail(productId, client),
  });

/** Master data, không đổi trong phiên → không refetch. */
export const categoriesQuery = (client?: IHttpClient) =>
  appQueryOptions({
    queryKey: queryKeys.products.categories(),
    queryFn: () => getCategories(client),
    staleTime: Infinity,
  });
