"use client";

import { createContext, use, useEffect, useMemo, useState } from "react";
import { MarkerMap, type TMapMarker } from "@/shared/components/organisms";
import { type TCoordinates, useGeolocation } from "@/shared/hooks";
import { useMe } from "@/features/user";
import { LOCATE_WAIT_MS, USER_LABELS } from "../constants/distributor.constants";
import { useNearbyDistributors } from "../hooks/use-nearby-distributors";
import type { TNearbyDistributorsParams } from "../types/distributor.types";
import { DistributorList } from "./distributor-list";

type TExplorerContext = {
  query: ReturnType<typeof useNearbyDistributors>;
  locating: boolean;
  userLocation: TCoordinates | null;
  /** Nhãn marker người xem trên map. */
  userLabel: string;
  selectedId: string | null;
  select: (id: string) => void;
};

const ExplorerContext = createContext<TExplorerContext | null>(null);

function useExplorer() {
  const context = use(ExplorerContext);
  if (!context) throw new Error("DistributorExplorer.* phải nằm trong <DistributorExplorerProvider>");
  return context;
}

/** Nguồn vị trí: `geolocation` = guest (xin định vị trình duyệt); `profile` = đã đăng nhập (primary address). */
export type TExplorerOrigin = "geolocation" | "profile";

export type TDistributorExplorerProviderProps = {
  origin?: TExplorerOrigin;
  children: React.ReactNode;
};

/**
 * Trạng thái chung của map (5) + list (7) ở trang "/" (ui-ux.md §6) — 1 query cho cả hai.
 * Hook không gọi có điều kiện được → mỗi nguồn vị trí là một component riêng, cùng đổ vào ExplorerCore.
 */
export function DistributorExplorerProvider({ origin = "geolocation", children }: TDistributorExplorerProviderProps) {
  return origin === "profile" ? (
    <ProfileOrigin>{children}</ProfileOrigin>
  ) : (
    <GeolocationOrigin>{children}</GeolocationOrigin>
  );
}

/** Guest: xin định vị 1 lần khi mount → có vị trí thì gửi lat/long, bị từ chối/quá hạn thì không gửi (toàn quốc). */
function GeolocationOrigin({ children }: { children: React.ReactNode }) {
  const { coords, status, request } = useGeolocation();
  const [waitExpired, setWaitExpired] = useState(false);

  useEffect(() => {
    request();
    const timer = setTimeout(() => setWaitExpired(true), LOCATE_WAIT_MS);
    return () => clearTimeout(timer);
  }, [request]);

  const locating = (status === "idle" || status === "loading") && !waitExpired;
  const params = useMemo<TNearbyDistributorsParams>(() => (coords ? { lat: coords.lat, long: coords.long } : {}), [coords]);

  return (
    <ExplorerCore params={params} locating={locating} userLocation={coords} userLabel={USER_LABELS.geolocation}>
      {children}
    </ExplorerCore>
  );
}

const NO_LOCATION_PARAMS: TNearbyDistributorsParams = {};

/**
 * Đã đăng nhập: không xin định vị, không gửi lat/long → server tự dùng primary address (source `address`).
 * Marker người xem = address của /users/me; chưa có address → server trả toàn quốc, không marker.
 */
function ProfileOrigin({ children }: { children: React.ReactNode }) {
  const { data: me } = useMe();
  const address = me?.address;
  const userLocation = useMemo<TCoordinates | null>(
    () => (address ? { lat: address.lat, long: address.long } : null),
    [address],
  );

  return (
    <ExplorerCore params={NO_LOCATION_PARAMS} locating={false} userLocation={userLocation} userLabel={USER_LABELS.profile}>
      {children}
    </ExplorerCore>
  );
}

type TExplorerCoreProps = {
  params: TNearbyDistributorsParams;
  locating: boolean;
  userLocation: TCoordinates | null;
  userLabel: string;
  children: React.ReactNode;
};

function ExplorerCore({ params, locating, userLocation, userLabel, children }: TExplorerCoreProps) {
  const query = useNearbyDistributors(params, { enabled: !locating });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const value = useMemo<TExplorerContext>(
    () => ({ query, locating, userLocation, userLabel, selectedId, select: setSelectedId }),
    [query, locating, userLocation, userLabel, selectedId],
  );

  return <ExplorerContext value={value}>{children}</ExplorerContext>;
}

/** Bản đồ distributor (5) — click marker → chọn item tương ứng ở list. */
export function DistributorExplorerMap({ className }: { className?: string }) {
  const { query, userLocation, userLabel, selectedId, select } = useExplorer();
  const items = query.data?.items;
  const markers = useMemo<TMapMarker[]>(
    () =>
      items?.map(({ userId, username, address }) => ({
        id: userId,
        position: { lat: address.lat, long: address.long },
        label: username,
      })) ?? [],
    [items],
  );

  return (
    <MarkerMap
      markers={markers}
      selectedId={selectedId}
      onSelect={select}
      userLocation={userLocation}
      userLabel={userLabel}
      className={className}
      aria-label="Bản đồ distributor"
    />
  );
}

/** Danh sách distributor (7) — highlight + cuộn tới item được chọn trên map. */
export function DistributorExplorerList({ className }: { className?: string }) {
  const { query, locating, selectedId } = useExplorer();
  return <DistributorList query={query} locating={locating} selectedId={selectedId} className={className} />;
}
