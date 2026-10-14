import type { IHttpClient } from "@/shared/lib/http";
import { appInfiniteQueryOptions, appQueryOptions, queryKeys } from "@/shared/lib/query";
import { getDistributorProfile, getNearbyDistributors } from "../services/distributor.service";
import type { TNearbyDistributorsParams } from "../types/distributor.types";

export const NEARBY_DISTRIBUTORS_PAGE_SIZE = 20;

/** API phân trang theo `page` (không phải cursor) — hết trang khi đã tải đủ `total` hoặc trang rỗng. */
export const nearbyDistributorsQuery = (params: TNearbyDistributorsParams, client?: IHttpClient) =>
  appInfiniteQueryOptions({
    queryKey: queryKeys.distributors.nearby(params),
    queryFn: ({ pageParam }) =>
      getNearbyDistributors({ ...params, page: pageParam, limit: NEARBY_DISTRIBUTORS_PAGE_SIZE }, client),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((count, page) => count + page.items.length, 0);
      return lastPage.items.length > 0 && loaded < lastPage.total ? allPages.length + 1 : undefined;
    },
  });

/** Profile public của distributor — dùng cho trang /profile/<id> (prefetch trên server). */
export const distributorProfileQuery = (distributorId: string, client?: IHttpClient) =>
  appQueryOptions({
    queryKey: queryKeys.distributors.detail(distributorId),
    queryFn: () => getDistributorProfile(distributorId, client),
  });
