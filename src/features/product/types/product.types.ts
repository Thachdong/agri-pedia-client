import type { TMediaType } from "@/features/media";
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
