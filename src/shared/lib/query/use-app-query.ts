import {
  useInfiniteQuery,
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
