import type { TBoundsTuple } from "@/shared/constants";
import type { TCoordinates } from "@/shared/hooks";

export const isWithinBounds = ([[south, west], [north, east]]: TBoundsTuple, { lat, long }: TCoordinates): boolean =>
  lat >= south && lat <= north && long >= west && long <= east;
