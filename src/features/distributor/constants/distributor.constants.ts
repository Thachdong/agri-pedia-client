import type { TNearbyScope } from "../types/distributor.types";

/** Tiêu đề danh sách theo stage server đã chọn. */
export const NEARBY_SCOPE_TITLES: Record<TNearbyScope, string> = {
  radius: "Distributor gần bạn",
  nationwide_by_distance: "Distributor gần bạn nhất",
  province: "Distributor trong tỉnh/thành",
  nationwide: "Distributor trên toàn quốc",
};

/** Ghi chú khi server phải nới phạm vi tìm (không có ai trong bán kính / tỉnh đã chọn). */
export const NEARBY_SCOPE_NOTES: Partial<Record<TNearbyScope, string>> = {
  nationwide_by_distance: "Không có distributor nào trong bán kính gần bạn — đang hiển thị theo khoảng cách trên toàn quốc.",
};

/** Số card skeleton khi đang tải trang đầu. */
export const LIST_SKELETON_COUNT = 5;

/**
 * Chờ tối đa bấy nhiêu cho quyền/vị trí từ trình duyệt (người dùng có thể bỏ mặc hộp thoại xin quyền).
 * Quá hạn → tải danh sách toàn quốc; vị trí về sau vẫn được dùng (query đổi key, tải lại).
 */
export const LOCATE_WAIT_MS = 8_000;

/** Nhãn marker người xem theo nguồn vị trí. */
export const USER_LABELS = {
  geolocation: "Bạn ở đây",
  profile: "Địa chỉ của bạn",
} as const;
