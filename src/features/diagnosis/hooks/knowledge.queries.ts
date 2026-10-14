import type { IHttpClient } from "@/shared/lib/http";
import { appQueryOptions, queryKeys } from "@/shared/lib/query";
import { getCrops } from "../services/knowledge.service";

/** Danh mục cây trồng gần như không đổi trong phiên. */
export const cropsQuery = (client?: IHttpClient) =>
  appQueryOptions({
    queryKey: queryKeys.knowledge.crops(),
    queryFn: () => getCrops(client),
    staleTime: Infinity,
  });
