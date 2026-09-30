import {
  defaultShouldDehydrateQuery,
  isServer,
  MutationCache,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";
import { isAppError } from "@/shared/lib/http";
import { handleGlobalError } from "./query-error";

const MAX_RETRIES = 2;

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        // Lỗi 4xx là lỗi nghiệp vụ/phân quyền → không retry; chỉ retry lỗi mạng / 5xx.
        retry: (failureCount, error) =>
          !(isAppError(error) && error.status >= 400 && error.status < 500) && failureCount < MAX_RETRIES,
      },
      mutations: { retry: false },
      dehydrate: {
        shouldDehydrateQuery: (query) => defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
    },
    queryCache: new QueryCache({ onError: (error, query) => handleGlobalError(error, query.meta) }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _onMutateResult, mutation) => handleGlobalError(error, mutation.meta),
    }),
  });
}

let browserQueryClient: QueryClient | undefined;

/** Server: client mới mỗi request (không chia sẻ data giữa user). Browser: một instance duy nhất. */
export function getQueryClient(): QueryClient {
  if (isServer) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
