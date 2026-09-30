"use client";

import dynamic from "next/dynamic";
import { cn } from "@/shared/lib/utils";

/** Leaflet cần `window` → chỉ render phía client. */
export const MapPicker = dynamic(() => import("./map-picker-view"), {
  ssr: false,
  loading: () => <MapPickerSkeleton />,
});

function MapPickerSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex h-80 w-full animate-pulse items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground", className)}
      role="status"
    >
      Đang tải bản đồ…
    </div>
  );
}

export type { TMapPickerProps } from "./map-picker.types";
