const KM_FORMAT = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 });
const KM_FORMAT_ROUNDED = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 });

/** Mét → chuỗi hiển thị: `850 m`, `1,2 km`, `128 km` (≥ 100 km bỏ phần thập phân). */
export function formatDistance(meters: number): string {
  const rounded = Math.round(meters);
  if (rounded < 1000) return `${rounded} m`;
  const km = meters / 1000;
  return `${(km >= 100 ? KM_FORMAT_ROUNDED : KM_FORMAT).format(km)} km`;
}
