"use client";

import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MarkerMap, type TMapMarker } from "@/shared/components/organisms";
import { type TCoordinates, useGeolocation } from "@/shared/hooks";
import { cn } from "@/shared/lib/utils";
import { useMe } from "@/features/user";
import { LOCATE_WAIT_MS, USER_LABELS } from "../constants/distributor.constants";
import { useNearbyDistributors } from "../hooks/use-nearby-distributors";
import type { TNearbyDistributorsParams } from "../types/distributor.types";
import { DistributorList } from "./distributor-list";

type TExplorerContext = {
  query: ReturnType<typeof useNearbyDistributors>;
  /** Khối map đã vào khung nhìn — trước đó không xin định vị, không init map, không tải danh sách. */
  active: boolean;
  activate: () => void;
  locating: boolean;
  userLocation: TCoordinates | null;
  /** Nhãn marker người xem trên map. */
  userLabel?: string;
  selectedId: string | null;
  select: (id: string) => void;
  ownShopId?: string;
};

const ExplorerContext = createContext<TExplorerContext | null>(null);

function useExplorer() {
  const context = use(ExplorerContext);
  if (!context) throw new Error("DistributorExplorer.* phải nằm trong <DistributorExplorerProvider>");
  return context;
}

/**
 * Nguồn vị trí: `geolocation` = guest (xin định vị trình duyệt); `profile` = FARMER / DISTRIBUTOR (primary address);
 * `all` = ADMIN (không vị trí, toàn quốc).
 */
export type TExplorerOrigin = "geolocation" | "profile" | "all";

export type TDistributorExplorerProviderProps = {
  origin?: TExplorerOrigin;
  /** DISTRIBUTOR đang xem: shop của mình ghim đầu danh sách, chỉ shop này mở được. */
  ownShopId?: string;
  children: React.ReactNode;
};

type TOriginProps = { active: boolean; children: (location: TOriginState) => React.ReactNode };
type TOriginState = Pick<TExplorerContext, "locating" | "userLocation" | "userLabel"> & {
  params: TNearbyDistributorsParams;
};

/**
 * Trạng thái chung của map (5) + list (7) ở trang "/" — 1 query cho cả hai. Lazy: chỉ khi DistributorExplorerMap
 * vào khung nhìn mới xin định vị (guest), init map và tải danh sách.
 * Hook không gọi có điều kiện được → mỗi nguồn vị trí là một component riêng.
 */
export function DistributorExplorerProvider({ origin = "geolocation", ownShopId, children }: TDistributorExplorerProviderProps) {
  const [active, setActive] = useState(false);
  const activate = useCallback(() => setActive(true), []);
  const Origin = ORIGINS[origin];

  return (
    <Origin active={active}>
      {(location) => (
        <ExplorerCore {...location} active={active} activate={activate} ownShopId={ownShopId}>
          {children}
        </ExplorerCore>
      )}
    </Origin>
  );
}

/** Guest: xin định vị khi khối map hiện ra → có vị trí thì gửi lat/long, bị từ chối/quá hạn thì không gửi (toàn quốc). */
function GeolocationOrigin({ active, children }: TOriginProps) {
  const { coords, status, request } = useGeolocation();
  const [waitExpired, setWaitExpired] = useState(false);

  useEffect(() => {
    if (!active) return;
    request();
    const timer = setTimeout(() => setWaitExpired(true), LOCATE_WAIT_MS);
    return () => clearTimeout(timer);
  }, [active, request]);

  const locating = (status === "idle" || status === "loading") && !waitExpired;
  const params = useMemo<TNearbyDistributorsParams>(() => (coords ? { lat: coords.lat, long: coords.long } : {}), [coords]);

  return children({ params, locating, userLocation: coords, userLabel: USER_LABELS.geolocation });
}

const NO_LOCATION_PARAMS: TNearbyDistributorsParams = {};

/**
 * Đã đăng nhập: không xin định vị, không gửi lat/long → server tự dùng primary address (source `address`).
 * Marker người xem = address của /users/me; chưa có address → server trả toàn quốc, không marker.
 */
function ProfileOrigin({ children }: TOriginProps) {
  const { data: me } = useMe();
  const address = me?.address;
  const userLocation = useMemo<TCoordinates | null>(
    () => (address ? { lat: address.lat, long: address.long } : null),
    [address],
  );

  return children({ params: NO_LOCATION_PARAMS, locating: false, userLocation, userLabel: USER_LABELS.profile });
}

/** ADMIN: toàn bộ distributor (không gửi vị trí, không marker người xem, không hỏi vị trí). */
function AllOrigin({ children }: TOriginProps) {
  return children({ params: NO_LOCATION_PARAMS, locating: false, userLocation: null });
}

const ORIGINS: Record<TExplorerOrigin, (props: TOriginProps) => React.ReactNode> = {
  geolocation: GeolocationOrigin,
  profile: ProfileOrigin,
  all: AllOrigin,
};

type TExplorerCoreProps = TOriginState &
  Pick<TExplorerContext, "active" | "activate" | "ownShopId"> & { children: React.ReactNode };

function ExplorerCore({
  params,
  active,
  activate,
  locating,
  userLocation,
  userLabel,
  ownShopId,
  children,
}: TExplorerCoreProps) {
  const query = useNearbyDistributors(params, { enabled: active && !locating });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const value = useMemo<TExplorerContext>(
    () => ({ query, active, activate, locating, userLocation, userLabel, selectedId, select: setSelectedId, ownShopId }),
    [query, active, activate, locating, userLocation, userLabel, selectedId, ownShopId],
  );

  return <ExplorerContext value={value}>{children}</ExplorerContext>;
}

/**
 * Bản đồ distributor (5) — click marker → chọn item tương ứng ở list. Chưa vào khung nhìn → khung chờ
 * (chưa tải Leaflet); vào khung nhìn (trước ~200px) → kích hoạt explorer.
 */
export function DistributorExplorerMap({ className }: { className?: string }) {
  const { query, active, activate, userLocation, userLabel, selectedId, select } = useExplorer();
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

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = containerRef.current;
    if (active || !container) return;
    const observer = new IntersectionObserver(([entry]) => entry?.isIntersecting && activate(), {
      rootMargin: "200px",
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [active, activate]);

  return (
    <div ref={containerRef} className={cn("size-full", className)}>
      {active ? (
        <MarkerMap
          markers={markers}
          selectedId={selectedId}
          onSelect={select}
          userLocation={userLocation}
          userLabel={userLabel}
          aria-label="Bản đồ distributor"
        />
      ) : (
        <div aria-hidden className="size-full bg-muted" />
      )}
    </div>
  );
}

/** Danh sách distributor (7) — highlight + cuộn tới item được chọn trên map. */
export function DistributorExplorerList({ className }: { className?: string }) {
  const { query, active, locating, selectedId, ownShopId } = useExplorer();
  return (
    <DistributorList
      query={query}
      locating={!active || locating}
      selectedId={selectedId}
      ownShopId={ownShopId}
      className={className}
    />
  );
}
