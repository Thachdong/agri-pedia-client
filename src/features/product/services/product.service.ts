import { http, type IHttpClient } from "@/shared/lib/http";
import type {
  TCategoriesResponse,
  TCreateProductInput,
  TCreateProductResponse,
  TDistributorProductsPage,
  TProductDetail,
  TProductSuggestion,
  TUpdateProductInput,
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

/** Chỉ seller của product (403 PRODUCT_SELLER_NOT_ALLOWED / PRODUCT_NOT_OWNER); đã xoá → 404 PRODUCT_NOT_FOUND. Body rỗng. */
export const updateProduct = (productId: string, input: TUpdateProductInput, client: IHttpClient = http) =>
  client.patch<void>(`/products/${encodeURIComponent(productId)}`, input);

/** Soft delete — chỉ seller (403 PRODUCT_SELLER_NOT_ALLOWED / PRODUCT_NOT_OWNER); đã xoá → 404 PRODUCT_NOT_FOUND. Body rỗng. */
export const deleteProduct = (productId: string, client: IHttpClient = http) =>
  client.delete<void>(`/products/${encodeURIComponent(productId)}`);

/**
 * Gợi ý tên + mô tả từ ảnh nhãn (multipart `image`, 1 ảnh jpg/png/webp ≤ 5 MB; ảnh không được lưu). Chỉ DISTRIBUTOR
 * ACTIVE (403 PRODUCT_SELLER_NOT_ALLOWED). 400 PRODUCT_SUGGESTION_INVALID_IMAGE, 413 quá 5 MB,
 * 422 PRODUCT_SUGGESTION_QUOTA_EXCEEDED (hết lượt trọn đời). Không tự set content-type để browser thêm boundary.
 */
export const suggestProduct = (image: Blob, client: IHttpClient = http) => {
  const form = new FormData();
  form.append("image", image, "label.jpg");
  return client.post<TProductSuggestion>("/products/suggestions", form);
};
