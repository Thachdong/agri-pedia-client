import { v } from "./joi";

/** Số VN: +84 | 84 | 0 + 9 số; chấp nhận khoảng trắng . - ( ) — khớp rule `identifier` (PHONE) của API. */
const VN_PHONE = /^(\+84|84|0)\d{9}$/;
const PHONE_SEPARATORS = /[\s.\-()]/g;

/** Rule dùng chung, khớp constraint của NestJS DTO (specs/openapi.json + specs/api.md). */
export const rules = {
  id: () => v.string().guid(),
  // Browser build của joi không có danh sách TLD → tắt kiểm tra TLD.
  email: () => v.string().trim().max(255).email({ tlds: { allow: false } }),
  phone: () =>
    v
      .string()
      .trim()
      .replace(PHONE_SEPARATORS, "")
      .pattern(VN_PHONE)
      .messages({ "string.pattern.base": "Số điện thoại không hợp lệ" }),
  password: () => v.string().min(8).max(128),
  username: () => v.string().trim().min(1).max(100),
};
