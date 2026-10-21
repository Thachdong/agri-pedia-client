import type { TLocationItem } from "../types/location.types";

/** Tiền tố cấp hành chính — master data và provider ghi không giống nhau ("Thành phố Hà Nội" ↔ "Hà Nội"). */
const ADMIN_PREFIX = /^(thanh pho|tinh|phuong|xa|dac khu|thi tran|thi xa|quan|huyen) /;

/** Bỏ dấu, chữ thường, chỉ giữ chữ/số cách nhau 1 khoảng trắng. */
const normalize = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const stripPrefix = (name: string) => name.replace(ADMIN_PREFIX, "");

/**
 * Item master data khớp 1 trong `places` (tên từ reverse geocode). Ưu tiên khớp cả tiền tố
 * ("Phường X" ≠ "Xã X"), không có mới so phần tên. Không khớp → `undefined`.
 */
export function matchPlace<T extends TLocationItem>(items: T[], places: string[]): T | undefined {
  const names = places.map(normalize);
  const exact = items.find((item) => names.includes(normalize(item.name)));
  if (exact) return exact;

  const stripped = names.map(stripPrefix);
  return items.find((item) => stripped.includes(stripPrefix(normalize(item.name))));
}
