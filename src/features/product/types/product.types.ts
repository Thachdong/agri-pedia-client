import type { TApiSchema } from "@/shared/lib/http";

/** Item list GET /products — chỉ ACTIVE; `thumbnail` là signed URL ảnh đầu (hết hạn) hoặc null. */
export type TDistributorProduct = TApiSchema<"DistributorProductResponse">;
export type TDistributorProductsPage = TApiSchema<"ListDistributorProductsResponse">;
