/** [lat, long] */
export type TLatLngTuple = [number, number];
/** [tây nam, đông bắc] */
export type TBoundsTuple = [TLatLngTuple, TLatLngTuple];

/**
 * Khung hiển thị mặc định + giới hạn của mọi bản đồ (Specs/19102026/map-size.png): trọn đất liền Việt Nam và
 * quần đảo Hoàng Sa, mép đông tới khoảng Hồng Kông — bỏ bớt biển phía đông / nam để bản đồ không quá nhỏ.
 */
export const VN_BOUNDS: TBoundsTuple = [
  [8.0, 102.1],
  [23.8, 115.8],
];

/**
 * Bước zoom của mọi bản đồ — zoom lẻ để khung VN_BOUNDS vừa khít khung chứa (zoom nguyên phải lùi cả 1 mức,
 * bản đồ nhỏ đi một nửa). Nút +/- vẫn đổi 1 mức.
 */
export const MAP_ZOOM_SNAP = 0.25;
