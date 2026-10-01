import type { TProductStatus, TProductUnit } from "../types/product.types";

/** Giá trị server chấp nhận (CreateProductDto / UpdateProductDto) — nhãn hiển thị thêm ở bước UI. */
export const PRODUCT_UNITS = ["kg", "10kg", "50kg", "100kg", "bag", "piece", "ton"] as const satisfies readonly TProductUnit[];
export const PRODUCT_STATUSES = ["ACTIVE", "INACTIVE", "OUT_OF_STOCK"] as const satisfies readonly TProductStatus[];

/** Ràng buộc từ DTO + action 13 / 14 (specs/api.md). */
export const PRODUCT_NAME_MAX = 255;
export const PRODUCT_DESCRIPTION_MAX = 5000;
export const PRODUCT_PRICE_MAX = 999_999_999_999.99;
export const PRODUCT_QUANTITY_MAX = 2_147_483_647;
/** Số media mỗi lần gửi: create 1..10, update addMedia / removeMediaIds 0..10. */
export const PRODUCT_MEDIA_MAX = 10;
