"use client";

import { latLngBounds } from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import type { TBoundsTuple } from "@/shared/constants";

/** Container đổi kích thước (dialog mở có animation, layout responsive, xoay màn hình) → Leaflet tính lại, tránh tile bị xám. */
export function InvalidateOnResize() {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}

/**
 * Khoá bản đồ trong `bounds`: không kéo ra ngoài và không zoom ra xa hơn mức vừa khung.
 * Kéo "cứng" ở mép cần thêm `maxBoundsViscosity={1}` trên `MapContainer`.
 * minZoom tính lại mỗi khi container đổi kích thước.
 */
export function LockToBounds({ bounds }: { bounds: TBoundsTuple }) {
  const map = useMap();
  useEffect(() => {
    const target = latLngBounds(bounds);
    map.setMaxBounds(target.pad(0.05));
    const updateMinZoom = () => map.setMinZoom(map.getBoundsZoom(target));
    updateMinZoom();
    map.on("resize", updateMinZoom);
    return () => {
      map.off("resize", updateMinZoom);
    };
  }, [map, bounds]);
  return null;
}
