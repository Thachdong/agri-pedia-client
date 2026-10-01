const RELATIVE = new Intl.RelativeTimeFormat("vi-VN", { numeric: "auto" });

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

/**
 * ISO / Date → "vừa xong", "5 phút trước", "3 giờ trước", "hôm qua", "2 tháng trước"...
 * `now` truyền vào để hàm thuần (test, hoặc đồng bộ mốc giữa nhiều item).
 */
export function formatRelativeTime(value: string | Date, now: number = Date.now()): string {
  const seconds = Math.round((new Date(value).getTime() - now) / 1000);
  if (Math.abs(seconds) < 60) return "vừa xong";
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return RELATIVE.format(Math.trunc(seconds / size), unit);
  }
  return "vừa xong";
}
