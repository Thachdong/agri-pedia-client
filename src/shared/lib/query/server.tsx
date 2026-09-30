import "server-only";
import { dehydrate, HydrationBoundary, type DehydratedState, type FetchQueryOptions } from "@tanstack/react-query";
import { makeQueryClient } from "./query-client";

/**
 * Mỗi phần tử có data/key riêng → không gom được về một generic chung.
 * `unknown` không nhận được options có kiểu cụ thể (staleTime/queryFn là hàm, tham số contravariant) → dùng `any`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TPrefetchOptions = FetchQueryOptions<any, any, any, any>;

/**
 * Prefetch trên server rồi dehydrate — dùng ở `page.tsx`:
 *   const state = await prefetch([cropDetailQuery(id, serverHttp)]);
 *   return <HydrateQueries state={state}>...</HydrateQueries>;
 */
export async function prefetch(queries: TPrefetchOptions[]): Promise<DehydratedState> {
  const queryClient = makeQueryClient();
  await Promise.all(queries.map((query) => queryClient.prefetchQuery(query)));
  return dehydrate(queryClient);
}

export function HydrateQueries({ state, children }: { state: DehydratedState; children: React.ReactNode }) {
  return <HydrationBoundary state={state}>{children}</HydrationBoundary>;
}
