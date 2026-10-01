import "server-only";
import {
  dehydrate,
  hashKey,
  HydrationBoundary,
  type DehydratedState,
  type FetchQueryOptions,
  type QueryKey,
} from "@tanstack/react-query";
import { makeQueryClient } from "./query-client";

/**
 * Mỗi phần tử có data/key riêng → không gom được về một generic chung.
 * `unknown` không nhận được options có kiểu cụ thể (staleTime/queryFn là hàm, tham số contravariant) → dùng `any`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TPrefetchOptions = FetchQueryOptions<any, any, any, any>;

export type TPrefetchConfig = {
  /**
   * Query bắt buộc của trang — lỗi thì NÉM ra (AppError) thay vì nuốt như `queries`,
   * để page phân biệt 404 (→ `notFound()`) với lỗi khác.
   */
  required?: TPrefetchOptions[];
};

/**
 * Prefetch trên server rồi dehydrate — dùng ở `page.tsx`:
 *   const state = await prefetch([cropDetailQuery(id, serverHttp)]);
 *   return <HydrateQueries state={state}>...</HydrateQueries>;
 */
export async function prefetch(
  queries: TPrefetchOptions[],
  { required = [] }: TPrefetchConfig = {},
): Promise<DehydratedState> {
  const queryClient = makeQueryClient();
  await Promise.all([
    ...queries.map((query) => queryClient.prefetchQuery(query)),
    ...required.map((query) => queryClient.fetchQuery(query)),
  ]);
  return dehydrate(queryClient);
}

export function HydrateQueries({ state, children }: { state: DehydratedState; children: React.ReactNode }) {
  return <HydrationBoundary state={state}>{children}</HydrationBoundary>;
}

/**
 * Đọc data một query vừa prefetch (vd. role của /users/me để redirect trên server).
 * `undefined` khi query lỗi / chưa có data (prefetch không ném lỗi).
 */
export function getPrefetchedData<TData>(state: DehydratedState, queryKey: QueryKey): TData | undefined {
  const hash = hashKey(queryKey);
  const query = state.queries.find((item) => item.queryHash === hash);
  return query?.state.status === "success" ? (query.state.data as TData) : undefined;
}
