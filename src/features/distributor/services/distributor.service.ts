import { http, type IHttpClient } from "@/shared/lib/http";
import type {
  TDistributorProfile,
  TNearbyDistributorsPageParams,
  TNearbyDistributorsResponse,
} from "../types/distributor.types";

export const getNearbyDistributors = (params: TNearbyDistributorsPageParams, client: IHttpClient = http) =>
  client.get<TNearbyDistributorsResponse>("/distributors/nearby", { query: params });

/** Public — id lạ / không phải DISTRIBUTOR ACTIVE → 404 USER_DISTRIBUTOR_NOT_FOUND. */
export const getDistributorProfile = (distributorId: string, client: IHttpClient = http) =>
  client.get<TDistributorProfile>(`/distributors/${encodeURIComponent(distributorId)}`);
