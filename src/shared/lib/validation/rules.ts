import type { TFileUpload } from "@/shared/types";
import { v } from "./joi";

/** Số VN: +84 | 84 | 0 + 9 số; chấp nhận khoảng trắng . - ( ) — khớp rule `identifier` (PHONE) của API. */
const VN_PHONE = /^(\+84|84|0)\d{9}$/;
const PHONE_SEPARATORS = /[\s.\-()]/g;

export type TFileRuleOptions = {
  /** Đuôi cho phép, viết thường, không dấu chấm (vd. ["jpg", "png"]). */
  extensions: readonly string[];
  maxBytes: number;
};

const formatMegabytes = (bytes: number) => `${Math.round((bytes / 1024 / 1024) * 10) / 10}MB`;

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
   * File chọn từ `<input type="file">` (trước khi upload) — kiểm tra đuôi + dung lượng như server/storage sẽ kiểm.
   * @deprecated Dùng `uploadedFile` (upload ngay khi chọn) — bỏ khi các form đã chuyển xong.
   */
  file: ({ extensions, maxBytes }: TFileRuleOptions) =>
    v.any().custom((value: unknown, helpers) => {
      if (!(value instanceof File)) return helpers.error("file.base");
      const dot = value.name.lastIndexOf(".");
      const extension = dot > 0 ? value.name.slice(dot + 1).toLowerCase() : "";
      if (!extensions.includes(extension)) return helpers.error("file.extension", { allowed: extensions.join(", ") });
      if (value.size > maxBytes) return helpers.error("file.maxSize", { limit: formatMegabytes(maxBytes) });
      return value;
    }),
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
