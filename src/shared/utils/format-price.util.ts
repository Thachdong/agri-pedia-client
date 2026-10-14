const VND_FORMAT = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 2 });

/** Số tiền (VND) → chuỗi hiển thị: `150.000 ₫`, `12.500,5 ₫`. */
export function formatPrice(amount: number): string {
  return VND_FORMAT.format(amount);
}
