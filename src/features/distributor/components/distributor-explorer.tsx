"use client";

import { createContext, use, useEffect, useMemo, useState } from "react";
import { MarkerMap, type TMapMarker } from "@/shared/components/organisms";
import { type TCoordinates, useGeolocation } from "@/shared/hooks";
import { LOCATE_WAIT_MS } from "../constants/distributor.constants";
import { useNearbyDistributors } from "../hooks/use-nearby-distributors";
import type { TNearbyDistributorsParams } from "../types/distributor.types";
import { DistributorList } from "./distributor-list";

type TExplorerContext = {
  query: ReturnType<typeof useNearbyDistributors>;
  locating: boolean;
  userLocation: TCoordinates | null;
  selectedId: string | null;
  select: (id: string) => void;
};

const ExplorerContext = createContext<TExplorerContext | null>(null);

function useExplorer() {
  const context = use(ExplorerContext);
  if (!context) throw new Error("DistributorExplorer.* phải nằm trong <DistributorExplorerProvider>");
  return context;
}

/**
 * Trạng thái chung của map (5) + list (7) ở trang "/" (ui-ux.md §6) — 1 query cho cả hai.
 * Guest: xin định vị 1 lần khi mount → có vị trí thì gửi lat/long, bị từ chối/quá hạn thì không gửi (toàn quốc).
 */
export function DistributorExplorerProvider({ children }: { children: React.ReactNode }) {
  const { coords, status, request } = useGeolocation();
  const [waitExpired, setWaitExpired] = useState(false);

  useEffect(() => {
    request();
    const timer = setTimeout(() => setWaitExpired(true), LOCATE_WAIT_MS);
    return () => clearTimeout(timer);
  }, [request]);

  const locating = (status === "idle" || status === "loading") && !waitExpired;
  const params = useMemo<TNearbyDistributorsParams>(() => (coords ? { lat: coords.lat, long: coords.long } : {}), [coords]);
  const query = useNearbyDistributors(params, { enabled: !locating });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const value = useMemo<TExplorerContext>(
    () => ({ query, locating, userLocation: coords, selectedId, select: setSelectedId }),
    [query, locating, coords, selectedId],
  );

  return <ExplorerContext value={value}>{children}</ExplorerContext>;
}

/** Bản đồ distributor (5) — click marker → chọn item tương ứng ở list. */
export function DistributorExplorerMap({ className }: { className?: string }) {
  const { query, userLocation, selectedId, select } = useExplorer();
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
