import type { TMediaType, TMediaUpload } from "@/features/media";
import type { TApiSchema } from "@/shared/lib/http";

/** Item list GET /products — chỉ ACTIVE; `thumbnail` là signed URL ảnh đầu (hết hạn) hoặc null. */
export type TDistributorProduct = TApiSchema<"DistributorProductResponse">;
export type TDistributorProductsPage = TApiSchema<"ListDistributorProductsResponse">;

/** Spec chưa khai báo enum cho `type` (sinh ra `Record<string, never>`) — thực tế IMAGE | VIDEO | FILE như lúc upload. */
export type TProductMedia = Omit<TApiSchema<"ProductMediaResponse">, "type"> & { type: TMediaType };

/** GET /products/:id — mọi status; `media` theo sortOrder, `url` là signed URL (hết hạn). Rating: GET /reviews/summary. */
export type TProductDetail = Omit<TApiSchema<"GetProductDetailResponse">, "media"> & { media: TProductMedia[] };
export type TProductStatus = TProductDetail["status"];
export type TProductUnit = TProductDetail["unit"];

/** Body POST /products — `media` (1..10) là file đã upload lên TMP (TUploadedMedia + sortOrder tuỳ chọn). */
export type TCreateProductInput = TApiSchema<"CreateProductDto">;
export type TCreateProductResponse = TApiSchema<"CreateProductResponse">;

/** Body PATCH /products/:id — field bỏ trống giữ nguyên (không gửi `null`); `addMedia` / `removeMediaIds` 0..10. */
export type TUpdateProductInput = TApiSchema<"UpdateProductDto">;

export type TCategory = TApiSchema<"CategoryResponse">;
export type TCategoriesResponse = TApiSchema<"ListCategoriesResponse">;

/**
 * Giá trị form tạo (M8) / sửa (M9) product — 1 shape cho cả 2 để dùng chung field.
 * `price` / `quantity` null = chưa nhập; `unit` "" = chưa chọn; `images` là ảnh mới (upload ngay khi chọn).
 * `status` / `removeMediaIds` chỉ dùng khi sửa (schema tạo bỏ qua).
 */
export type TProductFormValues = {
  name: string;
  description: string;
  price: number | null;
  quantity: number | null;
  categoryId: string;
  unit: TProductUnit | "";
  status: TProductStatus;
  images: TMediaUpload<"IMAGE">[];
  removeMediaIds: string[];
};
