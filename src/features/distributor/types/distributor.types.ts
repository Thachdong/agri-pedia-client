import type { TApiPaths, TApiSchema } from "@/shared/lib/http";

export type TNearbyDistributor = TApiSchema<"NearbyDistributorResponse">;
export type TNearbyDistributorsResponse = TApiSchema<"FindNearbyDistributorsResponse">;
export type TNearbyScope = TNearbyDistributorsResponse["scope"];

type TNearbyQuery = NonNullable<TApiPaths["/distributors/nearby"]["get"]["parameters"]["query"]>;

/** Vị trí lọc (point hoặc area, không gửi cả hai) — `page`/`limit` do infinite query quản lý. */
export type TNearbyDistributorsParams = Omit<TNearbyQuery, "page" | "limit">;

/** Request một trang. */
export type TNearbyDistributorsPageParams = TNearbyDistributorsParams & Pick<TNearbyQuery, "page" | "limit">;

/** Kết quả đã gộp các trang — map và list dùng chung. */
export type TNearbyDistributorsView = Pick<TNearbyDistributorsResponse, "scope" | "source" | "total"> & {
  items: TNearbyDistributor[];
};
