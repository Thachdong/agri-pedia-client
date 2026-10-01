import type { TProductStatus, TProductUnit } from "../types/product.types";

/** Giá trị server chấp nhận (CreateProductDto / UpdateProductDto) + nhãn hiển thị — thứ tự dùng cho Select. */
export const PRODUCT_UNIT_OPTIONS = [
  { value: "kg", label: "kg" },
  { value: "10kg", label: "bao 10kg" },
  { value: "50kg", label: "bao 50kg" },
  { value: "100kg", label: "bao 100kg" },
  { value: "bag", label: "bao" },
  { value: "piece", label: "cái" },
  { value: "ton", label: "tấn" },
] as const satisfies readonly { value: TProductUnit; label: string }[];

export const PRODUCT_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Đang bán" },
  { value: "INACTIVE", label: "Ngừng bán" },
  { value: "OUT_OF_STOCK", label: "Hết hàng" },
] as const satisfies readonly { value: TProductStatus; label: string }[];

export const PRODUCT_UNITS = PRODUCT_UNIT_OPTIONS.map((option) => option.value);
export const PRODUCT_STATUSES = PRODUCT_STATUS_OPTIONS.map((option) => option.value);

export const PRODUCT_UNIT_LABELS = Object.fromEntries(
  PRODUCT_UNIT_OPTIONS.map(({ value, label }) => [value, label]),
) as Record<TProductUnit, string>;

export const PRODUCT_STATUS_LABELS = Object.fromEntries(
  PRODUCT_STATUS_OPTIONS.map(({ value, label }) => [value, label]),
) as Record<TProductStatus, string>;

/** Ràng buộc từ DTO + action 13 / 14 (specs/api.md). */
export const PRODUCT_NAME_MAX = 255;
export const PRODUCT_DESCRIPTION_MAX = 5000;
export const PRODUCT_PRICE_MAX = 999_999_999_999.99;
export const PRODUCT_QUANTITY_MAX = 2_147_483_647;
/** Số media mỗi lần gửi: create 1..10, update addMedia / removeMediaIds 0..10. */
export const PRODUCT_MEDIA_MAX = 10;

/** Mã lỗi domain của POST / PATCH / DELETE /products mà UI xử lý riêng. */
export const PRODUCT_ERROR_CODE = {
  SELLER_NOT_ALLOWED: "PRODUCT_SELLER_NOT_ALLOWED",
  NOT_OWNER: "PRODUCT_NOT_OWNER",
  NOT_FOUND: "PRODUCT_NOT_FOUND",
  CATEGORY_NOT_FOUND: "PRODUCT_CATEGORY_NOT_FOUND",
  INVALID_PRICE: "PRODUCT_INVALID_PRICE",
  INVALID_QUANTITY: "PRODUCT_INVALID_QUANTITY",
} as const;

/** Message tiếng Việt thay cho message tiếng Anh của server. */
export const PRODUCT_ERROR_MESSAGES: Record<string, string> = {
  [PRODUCT_ERROR_CODE.SELLER_NOT_ALLOWED]: "Chỉ tài khoản nhà phân phối đã kích hoạt mới được quản lý sản phẩm.",
  [PRODUCT_ERROR_CODE.NOT_OWNER]: "Bạn không phải chủ của sản phẩm này.",
  [PRODUCT_ERROR_CODE.NOT_FOUND]: "Sản phẩm không còn tồn tại.",
  [PRODUCT_ERROR_CODE.CATEGORY_NOT_FOUND]: "Danh mục không còn tồn tại, vui lòng chọn lại.",
  [PRODUCT_ERROR_CODE.INVALID_PRICE]: "Giá không hợp lệ.",
  [PRODUCT_ERROR_CODE.INVALID_QUANTITY]: "Số lượng không hợp lệ.",
};
