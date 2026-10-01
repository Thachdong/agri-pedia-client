import { http, type IHttpClient } from "@/shared/lib/http";
import type { TNearbyDistributorsPageParams, TNearbyDistributorsResponse } from "../types/distributor.types";

export const getNearbyDistributors = (params: TNearbyDistributorsPageParams, client: IHttpClient = http) =>
  client.get<TNearbyDistributorsResponse>("/distributors/nearby", { query: params });
