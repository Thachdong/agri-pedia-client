import { toast as sonnerToast } from "sonner";

export type TToastOptions = {
  /** Dòng phụ dưới tiêu đề. */
  description?: string;
  /** Trùng id → thay toast cũ thay vì xếp chồng. */
  id?: string | number;
  /** ms; mặc định theo Toaster. */
  duration?: number;
};

type TToastId = string | number;

/** Thông báo ngắn của project — chỉ nơi này gọi `sonner`; Toaster gắn sẵn trong AppProviders. */
export const toast = {
  success: (message: string, options?: TToastOptions): TToastId => sonnerToast.success(message, options),
  error: (message: string, options?: TToastOptions): TToastId => sonnerToast.error(message, options),
  info: (message: string, options?: TToastOptions): TToastId => sonnerToast.info(message, options),
  warning: (message: string, options?: TToastOptions): TToastId => sonnerToast.warning(message, options),
  /** Không truyền id → đóng tất cả. */
  dismiss: (id?: TToastId) => {
    sonnerToast.dismiss(id);
  },
};
