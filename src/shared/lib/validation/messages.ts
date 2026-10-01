import type { LanguageMessages } from "joi";

/** Thông báo lỗi mặc định (tiếng Việt) theo error type của joi. Không kèm label vì lỗi hiển thị ngay dưới field. */
export const messages: LanguageMessages = {
  "any.required": "Trường này là bắt buộc",
  "any.only": "Giá trị không hợp lệ",
  "any.invalid": "Giá trị không hợp lệ",
  "string.base": "Giá trị phải là chuỗi",
  "string.empty": "Trường này là bắt buộc",
  "string.min": "Tối thiểu {#limit} ký tự",
  "string.max": "Tối đa {#limit} ký tự",
  "string.email": "Email không hợp lệ",
  "string.uri": "Đường dẫn không hợp lệ",
  "string.pattern.base": "Định dạng không hợp lệ",
  "number.base": "Giá trị phải là số",
  "number.integer": "Giá trị phải là số nguyên",
  "number.min": "Giá trị tối thiểu là {#limit}",
  "number.max": "Giá trị tối đa là {#limit}",
  "array.min": "Chọn tối thiểu {#limit} mục",
  "array.max": "Chọn tối đa {#limit} mục",
  "date.base": "Ngày không hợp lệ",
  "file.base": "File không hợp lệ",
  "file.extension": "Chỉ chấp nhận file {#allowed}",
  "file.maxSize": "File tối đa {#limit}",
  "file.uploading": "File đang tải lên, vui lòng đợi",
  "object.unknown": "Trường không được phép",
};
