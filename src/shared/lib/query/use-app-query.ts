import {
  useInfiniteQuery,
  useQueries,
  useQuery,
  useSuspenseQuery,
  type DefaultError,
  type InfiniteData,
  type QueryKey,
  type UseInfiniteQueryOptions,
  type UseQueryOptions,
  type UseSuspenseQueryOptions,
} from "@tanstack/react-query";

export function useAppQuery<TQueryFnData, TData = TQueryFnData, TQueryKey extends QueryKey = QueryKey>(
  options: UseQueryOptions<TQueryFnData, DefaultError, TData, TQueryKey>,
) {
  return useQuery(options);
}

export function useAppSuspenseQuery<TQueryFnData, TData = TQueryFnData, TQueryKey extends QueryKey = QueryKey>(
  options: UseSuspenseQueryOptions<TQueryFnData, DefaultError, TData, TQueryKey>,
) {
  return useSuspenseQuery(options);
}

/** Phân trang cursor-based của API (`cursor` / `nextCursor`). */
export function useAppInfiniteQuery<
  TQueryFnData,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(options: UseInfiniteQueryOptions<TQueryFnData, DefaultError, TData, TQueryKey, TPageParam>) {
  return useInfiniteQuery(options);
}

/**
 * Số lượng query thay đổi theo dữ liệu (vd. 1 query mỗi cây trong lịch sử) — cùng kiểu `queries` / `combine` của
 * react-query `useQueries`.
 */
export const useAppQueries: typeof useQueries = (options, queryClient) => useQueries(options, queryClient);
