/** [lat, long] */
export type TLatLngTuple = [number, number];
/** [tây nam, đông bắc] */
export type TBoundsTuple = [TLatLngTuple, TLatLngTuple];

/**
 * Khung lãnh thổ Việt Nam, gồm quần đảo Hoàng Sa và Trường Sa — mọi bản đồ bị giới hạn trong khung này
 * và mặc định hiển thị vừa khung.
 */
export const VN_BOUNDS: TBoundsTuple = [
  [6.0, 102.0],
  [23.5, 117.0],
];
