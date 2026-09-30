import type { TCoordinates } from "@/shared/hooks";

export type TMapPickerProps = {
  /** Vị trí đang chọn (marker). `null` = chưa chọn. */
  value: TCoordinates | null;
  /** Click lên map hoặc kéo marker. */
  onChange: (coords: TCoordinates) => void;
  /** Điểm cần bay tới (vd: vị trí hiện tại) — không đổi `value`. */
  focus?: TCoordinates | null;
  className?: string;
  "aria-label"?: string;
};

/** Tâm Việt Nam, đủ thấy cả nước. */
export const DEFAULT_MAP_CENTER: [number, number] = [16.05, 106.5];
export const DEFAULT_ZOOM = 5;
export const SELECTED_ZOOM = 16;
