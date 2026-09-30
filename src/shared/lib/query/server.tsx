import "server-only";
import { dehydrate, HydrationBoundary, type DehydratedState, type QueryClient } from "@tanstack/react-query";
import { makeQueryClient } from "./query-client";

type TPrefetchOptions = Parameters<QueryClient["prefetchQuery"]>[0];

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
