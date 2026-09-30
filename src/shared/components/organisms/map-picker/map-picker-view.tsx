"use client";

import "leaflet/dist/leaflet.css";
import { divIcon, type LeafletMouseEvent, type Marker as TLeafletMarker } from "leaflet";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { publicEnv } from "@/shared/config";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "@/shared/constants";
import type { TCoordinates } from "@/shared/hooks";
import { cn } from "@/shared/lib/utils";
import { SELECTED_ZOOM, type TMapPickerProps } from "./map-picker.types";

/** Pin SVG dùng currentColor → màu từ token (text-highlight), không phụ thuộc ảnh marker mặc định của Leaflet. */
const PIN_ICON = divIcon({
  className: "text-highlight",
  html: `<svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor" stroke="white" stroke-width="1.5" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Z"/><circle cx="12" cy="9" r="2.5" fill="white" stroke="none"/></svg>`,
  iconSize: [32, 32],
  iconAnchor: [16, 30],
});

const toLatLng = ({ lat, long }: TCoordinates): [number, number] => [lat, long];

function ClickToPick({ onChange }: { onChange: TMapPickerProps["onChange"] }) {
  useMapEvents({
    click: (event: LeafletMouseEvent) => onChange({ lat: event.latlng.lat, long: event.latlng.lng }),
  });
  return null;
}

/** Bay tới `focus` mỗi khi nó đổi (vd: sau khi lấy vị trí hiện tại). */
function FlyTo({ focus }: { focus?: TCoordinates | null }) {
  const map = useMap();
  useEffect(() => {
    if (focus) map.flyTo(toLatLng(focus), Math.max(map.getZoom(), SELECTED_ZOOM));
  }, [map, focus]);
  return null;
}

/** Container đổi kích thước (dialog mở có animation, xoay màn hình) → Leaflet tính lại, tránh tile bị xám. */
function InvalidateOnResize() {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}

export default function MapPickerView({ value, onChange, focus, className, "aria-label": ariaLabel }: TMapPickerProps) {
  const initial = value ?? focus;
  const markerHandlers = useMemo(
    () => ({
      dragend: (event: { target: TLeafletMarker }) => {
        const { lat, lng } = event.target.getLatLng();
        onChange({ lat, long: lng });
      },
    }),
    [onChange],
  );

  return (
    <div className={cn("h-80 w-full overflow-hidden rounded-lg border border-border", className)}>
      <MapContainer
        center={initial ? toLatLng(initial) : DEFAULT_MAP_CENTER}
        zoom={initial ? SELECTED_ZOOM : DEFAULT_MAP_ZOOM}
        className="size-full"
        aria-label={ariaLabel}
      >
        <TileLayer url={publicEnv.mapTileUrl} attribution={publicEnv.mapTileAttribution} />
        <InvalidateOnResize />
        <ClickToPick onChange={onChange} />
        <FlyTo focus={focus} />
        {value && (
          <Marker position={toLatLng(value)} icon={PIN_ICON} draggable eventHandlers={markerHandlers} title="Vị trí đã chọn" />
        )}
      </MapContainer>
    </div>
  );
}
