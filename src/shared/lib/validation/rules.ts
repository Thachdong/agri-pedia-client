import type { TFileUpload } from "@/shared/types";
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
  /**
   * Item upload-ngay-khi-chọn (`TFileUpload`) — phải upload xong mới cho submit.
   * Đuôi / dung lượng đã kiểm lúc chọn (useMediaUploads), file lỗi bị bỏ khỏi form nên không kiểm lại ở đây.
   */
  uploadedFile: () =>
    v.any().custom((value: unknown, helpers) => {
      const upload = value as Partial<TFileUpload> | null;
      if (!upload || typeof upload !== "object" || !(upload.file instanceof File)) return helpers.error("file.base");
      if (upload.status !== "done") return helpers.error("file.uploading");
      return value;
    }),
  username: () => v.string().trim().min(1).max(100),
  /** Code OTP (activate / reset password) — server cho phép 4..10 chữ số, client khoá đúng `length` đang cấu hình. */
  otpCode: (length: number) =>
    v
      .string()
      .trim()
      .pattern(new RegExp(`^\\d{${length}}$`))
      .messages({ "string.pattern.base": `Mã gồm ${length} chữ số`, "string.empty": `Vui lòng nhập đủ ${length} chữ số` }),
};
