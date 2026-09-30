"use client";

import "leaflet/dist/leaflet.css";
import { divIcon, latLngBounds } from "leaflet";
import { useEffect, useEffectEvent } from "react";
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import { publicEnv } from "@/shared/config";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "@/shared/constants";
import type { TCoordinates } from "@/shared/hooks";
import { cn } from "@/shared/lib/utils";
import {
  DEFAULT_USER_LABEL,
  FIT_MAX_ZOOM,
  FIT_NEAREST_COUNT,
  type TMapMarker,
  type TMarkerMapProps,
  USER_ONLY_ZOOM,
} from "./marker-map.types";

const PIN_PATH =
  '<path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Z"/><circle cx="12" cy="9" r="2.5" class="fill-background" stroke="none"/>';

/** Icon SVG dùng currentColor → màu từ token, không phụ thuộc ảnh marker mặc định của Leaflet. */
const pinIcon = (className: string, size: number) =>
  divIcon({
    className,
    html: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="currentColor" class="stroke-background" stroke-width="1.5" aria-hidden="true">${PIN_PATH}</svg>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size - 2],
    tooltipAnchor: [0, -size + 4],
  });

const PIN_ICON = pinIcon("text-primary", 30);
const PIN_SELECTED_ICON = pinIcon("text-highlight", 40);
/** Chấm vị trí người xem: vòng tỏa nhấp nháy (tắt khi prefers-reduced-motion) + chấm viền nền. */
const USER_ICON = divIcon({
  className: "",
  html: '<span class="relative flex size-7 items-center justify-center" aria-hidden="true"><span class="absolute inline-flex size-full animate-ping rounded-full bg-highlight opacity-50 motion-reduce:animate-none"></span><span class="relative inline-flex size-4 rounded-full border-2 border-background bg-highlight shadow-md"></span></span>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  tooltipAnchor: [0, -12],
});

const toLatLng = ({ lat, long }: TCoordinates): [number, number] => [lat, long];

/**
 * Fit khung nhìn quanh người xem + các marker gần nhất.
 * Chỉ chạy lại khi vị trí người xem hoặc marker đầu đổi (kết quả mới) — tải thêm trang không làm map nhảy.
 * Không có vị trí người xem → giữ khung cả nước.
 */
function FitToUser({ userLocation, markers }: { userLocation?: TCoordinates | null; markers: TMapMarker[] }) {
  const map = useMap();
  const fit = useEffectEvent(() => {
    if (!userLocation) return;
    const points = [userLocation, ...markers.slice(0, FIT_NEAREST_COUNT).map((marker) => marker.position)].map(toLatLng);
    if (points.length === 1) map.setView(points[0], USER_ONLY_ZOOM);
    else map.fitBounds(latLngBounds(points), { padding: [40, 40], maxZoom: FIT_MAX_ZOOM });
  });
  const firstId = markers[0]?.id;
  useEffect(() => {
    fit();
  }, [userLocation, firstId]);
  return null;
}

/** Container đổi kích thước (layout responsive, xoay màn hình) → Leaflet tính lại, tránh tile bị xám. */
function InvalidateOnResize() {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}

export function MarkerMapView({
  markers,
  selectedId,
  onSelect,
  userLocation,
  userLabel = DEFAULT_USER_LABEL,
  className,
  "aria-label": ariaLabel,
}: TMarkerMapProps) {
  return (
    <div className={cn("size-full overflow-hidden", className)}>
      <MapContainer center={DEFAULT_MAP_CENTER} zoom={DEFAULT_MAP_ZOOM} className="size-full" aria-label={ariaLabel}>
        <TileLayer url={publicEnv.mapTileUrl} attribution={publicEnv.mapTileAttribution} />
        <InvalidateOnResize />
        <FitToUser userLocation={userLocation} markers={markers} />
        {userLocation && (
          <Marker position={toLatLng(userLocation)} icon={USER_ICON} interactive={false} zIndexOffset={-100} title={userLabel}>
            <Tooltip permanent direction="top" className="font-semibold">
              {userLabel}
            </Tooltip>
          </Marker>
        )}
        {markers.map((marker) => {
          const selected = marker.id === selectedId;
          return (
            <Marker
              key={marker.id}
              position={toLatLng(marker.position)}
              icon={selected ? PIN_SELECTED_ICON : PIN_ICON}
              zIndexOffset={selected ? 1000 : 0}
              title={marker.label}
              eventHandlers={{ click: () => onSelect?.(marker.id) }}
            >
              <Tooltip direction="top">{marker.label}</Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
