"use client";

import dynamic from "next/dynamic";

/** Leaflet cần `window` → chỉ render phía client. */
export const MarkerMap = dynamic(() => import("./marker-map-view").then((module) => module.MarkerMapView), {
  ssr: false,
  loading: () => (
    <div
      className="flex size-full animate-pulse items-center justify-center bg-muted text-sm text-muted-foreground"
      role="status"
    >
      Đang tải bản đồ…
    </div>
  ),
});

export type { TMapMarker, TMarkerMapProps } from "./marker-map.types";
