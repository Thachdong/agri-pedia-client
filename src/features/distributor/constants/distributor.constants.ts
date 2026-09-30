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
