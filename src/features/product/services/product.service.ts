import { http, type IHttpClient } from "@/shared/lib/http";
import type {
  TCategoriesResponse,
  TCreateProductInput,
  TCreateProductResponse,
  TDistributorProductsPage,
  TProductDetail,
} from "../types/product.types";

/** Public — `distributorId` không phải DISTRIBUTOR → 404 PRODUCT_DISTRIBUTOR_NOT_FOUND. */
export const getDistributorProducts = (
  distributorId: string,
  { cursor, limit }: { cursor?: string; limit?: number } = {},
  client: IHttpClient = http,
) => client.get<TDistributorProductsPage>("/products", { query: { distributorId, cursor, limit } });

/** Public — product ở mọi status; đã xoá → 404 PRODUCT_NOT_FOUND. */
export const getProductDetail = (productId: string, client: IHttpClient = http) =>
  client.get<TProductDetail>(`/products/${encodeURIComponent(productId)}`);

/** Danh mục product, sắp theo tên (public). */
export const getCategories = (client: IHttpClient = http) => client.get<TCategoriesResponse>("/categories");

/**
 * Chỉ DISTRIBUTOR ACTIVE (403 PRODUCT_SELLER_NOT_ALLOWED); categoryId lạ → 404 PRODUCT_CATEGORY_NOT_FOUND.
 * Product tạo ra ở trạng thái ACTIVE; media không gắn được bị bỏ qua (server không báo lỗi).
 */
export const createProduct = (input: TCreateProductInput, client: IHttpClient = http) =>
  client.post<TCreateProductResponse>("/products", input);
