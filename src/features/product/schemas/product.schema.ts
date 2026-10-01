import { rules, schema, v } from "@/shared/lib/validation";
import {
  PRODUCT_DESCRIPTION_MAX,
  PRODUCT_MEDIA_MAX,
  PRODUCT_NAME_MAX,
  PRODUCT_PRICE_MAX,
  PRODUCT_QUANTITY_MAX,
  PRODUCT_STATUSES,
  PRODUCT_UNITS,
} from "../constants/product.constants";
import type { TProductFormValues } from "../types/product.types";

const PRICE_REQUIRED = "Vui lòng nhập giá";
const QUANTITY_REQUIRED = "Vui lòng nhập số lượng";

// Kiểm tra số thập phân thay vì `.precision(2)` — precision của joi tự làm tròn (convert) thay vì báo lỗi.
// So round-trip qua toFixed(2) (không nhân 100) để đúng cả với giá lớn tới PRODUCT_PRICE_MAX.
const hasAtMostTwoDecimals = (value: number) => Number(value.toFixed(2)) === value;

/** Ảnh mới phải upload xong (đuôi / dung lượng đã kiểm lúc chọn). */
const productImage = () => rules.uploadedFile();

/** Field chung create / update — mirror CreateProductDto + action 13 (specs/api.md). */
const baseFields = {
  name: v.string().trim().min(1).max(PRODUCT_NAME_MAX).required().messages({ "string.empty": "Vui lòng nhập tên sản phẩm" }),
  description: v
    .string()
    .trim()
    .min(1)
    .max(PRODUCT_DESCRIPTION_MAX)
    .required()
    .messages({ "string.empty": "Vui lòng nhập mô tả" }),
  price: v
    .number()
    .min(0)
    .max(PRODUCT_PRICE_MAX)
    .custom((value: number, helpers) => (hasAtMostTwoDecimals(value) ? value : helpers.error("number.decimals")))
    .required()
    .messages({
      "number.base": PRICE_REQUIRED,
      "any.required": PRICE_REQUIRED,
      "number.decimals": "Giá tối đa 2 chữ số thập phân",
    }),
  quantity: v
    .number()
    .integer()
    .min(0)
    .max(PRODUCT_QUANTITY_MAX)
    .required()
    .messages({ "number.base": QUANTITY_REQUIRED, "any.required": QUANTITY_REQUIRED }),
  categoryId: v.string().required().messages({ "string.empty": "Vui lòng chọn danh mục" }),
  unit: v
    .string()
    .valid(...PRODUCT_UNITS)
    .required()
    .messages({ "any.only": "Vui lòng chọn đơn vị", "string.empty": "Vui lòng chọn đơn vị" }),
};

/** M8 — tạo product: 1..10 ảnh; status (server tự đặt ACTIVE) / removeMediaIds bị bỏ. */
export const createProductSchema = schema<TProductFormValues>({
  ...baseFields,
  status: v.any().strip(),
  removeMediaIds: v.any().strip(),
  images: v
    .array()
    .items(productImage())
    .min(1)
    .max(PRODUCT_MEDIA_MAX)
    .required()
    .messages({ "array.min": "Vui lòng chọn ít nhất 1 ảnh", "array.max": `Tối đa ${PRODUCT_MEDIA_MAX} ảnh` }),
});

/** M9 — sửa product (mirror UpdateProductDto + action 14): thêm 0..10 ảnh, xoá 0..10 ảnh cũ mỗi lần lưu. */
export const updateProductSchema = schema<TProductFormValues>({
  ...baseFields,
  status: v
    .string()
    .valid(...PRODUCT_STATUSES)
    .required(),
  images: v
    .array()
    .items(productImage())
    .max(PRODUCT_MEDIA_MAX)
    .required()
    .messages({ "array.max": `Mỗi lần lưu thêm tối đa ${PRODUCT_MEDIA_MAX} ảnh` }),
  removeMediaIds: v
    .array()
    .items(v.string())
    .max(PRODUCT_MEDIA_MAX)
    .required()
    .messages({ "array.max": `Mỗi lần lưu xoá tối đa ${PRODUCT_MEDIA_MAX} ảnh` }),
});
