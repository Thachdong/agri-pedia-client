import type { TBusinessType, TLoginType, TUserRole } from "../types/auth.types";

export const LOGIN_TYPES = ["EMAIL", "PHONE"] as const satisfies readonly TLoginType[];

/** Nhãn tab theo wireframe. */
export const LOGIN_TYPE_LABELS: Record<TLoginType, string> = {
  EMAIL: "EMAIL",
  PHONE: "PHONE",
};

/** Khớp OTP_LENGTH của server (default 6). */
export const OTP_CODE_LENGTH = 6;

export const IDENTIFIER_LABELS: Record<TLoginType, string> = {
  EMAIL: "Email",
  PHONE: "Số điện thoại",
};

export const ROLE_OPTIONS = [
  { value: "FARMER", label: "Nông dân", description: "Tài khoản dùng được ngay" },
  { value: "DISTRIBUTOR", label: "Nhà phân phối", description: "Cần kích hoạt bằng mã gửi về email/số điện thoại" },
] as const satisfies readonly { value: TUserRole; label: string; description: string }[];

export const BUSINESS_TYPE_OPTIONS = [
  { value: "AGRICULTURAL_CHEMICAL_SUPPLIES", label: "Vật tư nông nghiệp (phân bón, thuốc BVTV)" },
  { value: "SEEDS_SEEDLINGS", label: "Giống cây trồng" },
  { value: "AQUACULTURE_SEEDLINGS", label: "Giống thuỷ sản" },
] as const satisfies readonly { value: TBusinessType; label: string }[];

/** Domain error của POST /auth/register → field + message hiển thị. */
export const REGISTER_ERROR_FIELDS = {
  USER_IDENTIFIER_ALREADY_USED: { field: "identifier", message: "Email/số điện thoại này đã được đăng ký" },
  USER_LOCATION_INVALID: { field: "address.ward", message: "Phường/xã không thuộc tỉnh/thành đã chọn" },
  USER_INVALID_COORDINATES: { field: "address.lat", message: "Vị trí trên bản đồ không hợp lệ" },
  USER_BUSINESS_TYPE_REQUIRED: { field: "bussinessType", message: "Vui lòng chọn loại hình kinh doanh" },
  USER_BUSINESS_TYPE_NOT_ALLOWED: { field: "bussinessType", message: "Nông dân không chọn loại hình kinh doanh" },
} as const;

/** Chờ giữa 2 lần gửi code, tính từ lúc đăng ký / lần gửi lại gần nhất (ui-ux.md §2). */
export const RESEND_CODE_COOLDOWN_MS = 3 * 60 * 1000;

/** Domain error của POST /auth/activate và POST /auth/resend → field (hoặc root) + message hiển thị. */
export const ACTIVATE_ERROR_FIELDS = {
  OTP_INVALID_CODE: { field: "code", message: "Mã kích hoạt không đúng" },
  OTP_EXPIRED: { field: "code", message: "Mã đã hết hạn, bấm Gửi lại để nhận mã mới" },
  OTP_NOT_FOUND: { field: "identifier", message: "Không tìm thấy mã kích hoạt cho tài khoản này" },
  OTP_ALREADY_CONSUMED: { field: "root", message: "Tài khoản đã được kích hoạt." },
  OTP_BLOCKED: { field: "root", message: "Mã tạm thời bị khoá do nhập sai hoặc gửi lại quá nhiều lần." },
} as const;

/** Domain error của POST /auth/login → message hiển thị dưới form (server không nói sai identifier hay password). */
export const LOGIN_ERROR_MESSAGES = {
  USER_INVALID_CREDENTIALS: "Email/số điện thoại hoặc mật khẩu không đúng.",
  USER_NOT_ACTIVE: "Tài khoản chưa được kích hoạt.",
} as const;

/** Domain error của POST /auth/reset-password → field (hoặc root) + message. OTP_ALREADY_REQUESTED không phải lỗi (form coi như đã gửi code). */
export const RESET_PASSWORD_ERROR_FIELDS = {
  OTP_ACCOUNT_NOT_FOUND: { field: "identifier", message: "Không tìm thấy tài khoản với email/số điện thoại này" },
  OTP_ACCOUNT_NOT_ACTIVE: { field: "root", message: "Tài khoản chưa được kích hoạt." },
  OTP_BLOCKED: { field: "root", message: "Yêu cầu reset mật khẩu tạm thời bị khoá do nhập sai mã quá nhiều lần." },
} as const;

/** Domain error của POST /auth/reset-password/confirm và POST /auth/resend (RESET_PASSWORD) → field (hoặc root) + message. */
export const CHANGE_PASSWORD_ERROR_FIELDS = {
  OTP_INVALID_CODE: { field: "code", message: "Mã xác nhận không đúng" },
  OTP_EXPIRED: { field: "code", message: "Mã đã hết hạn, bấm Gửi lại để nhận mã mới" },
  OTP_NOT_FOUND: { field: "identifier", message: "Chưa có yêu cầu reset mật khẩu cho tài khoản này" },
  OTP_ALREADY_CONSUMED: { field: "root", message: "Mã đã được sử dụng." },
  OTP_BLOCKED: { field: "root", message: "Mã tạm thời bị khoá do nhập sai hoặc gửi lại quá nhiều lần." },
} as const;
