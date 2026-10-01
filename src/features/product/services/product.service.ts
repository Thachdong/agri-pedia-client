import { http, type IHttpClient } from "@/shared/lib/http";
import type { TDistributorProductsPage, TProductDetail } from "../types/product.types";

/** Public — `distributorId` không phải DISTRIBUTOR → 404 PRODUCT_DISTRIBUTOR_NOT_FOUND. */
export const getDistributorProducts = (
  distributorId: string,
  { cursor, limit }: { cursor?: string; limit?: number } = {},
  client: IHttpClient = http,
) => client.get<TDistributorProductsPage>("/products", { query: { distributorId, cursor, limit } });

/** Public — product ở mọi status; đã xoá → 404 PRODUCT_NOT_FOUND. */
export const getProductDetail = (productId: string, client: IHttpClient = http) =>
  client.get<TProductDetail>(`/products/${encodeURIComponent(productId)}`);
