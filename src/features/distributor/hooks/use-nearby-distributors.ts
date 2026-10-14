import { useAppInfiniteQuery } from "@/shared/lib/query";
import type {
  TNearbyDistributorsParams,
  TNearbyDistributorsResponse,
  TNearbyDistributorsView,
} from "../types/distributor.types";
import { nearbyDistributorsQuery } from "./distributor.queries";

const toView = ({ pages }: { pages: TNearbyDistributorsResponse[] }): TNearbyDistributorsView => {
  const [first] = pages;
  return {
    scope: first.scope,
    source: first.source,
    total: first.total,
    items: pages.flatMap((page) => page.items),
  };
};

/** `enabled: false` khi vị trí chưa xác định xong — tránh gọi 2 lần (không vị trí rồi có vị trí). */
export const useNearbyDistributors = (params: TNearbyDistributorsParams, { enabled = true }: { enabled?: boolean } = {}) =>
  useAppInfiniteQuery({ ...nearbyDistributorsQuery(params), select: toView, enabled });
