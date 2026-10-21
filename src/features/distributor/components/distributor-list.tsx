"use client";

import { Loader2Icon, StoreIcon } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useProvinces } from "@/features/location";
import { Button } from "@/shared/components/atoms";
import { cn } from "@/shared/lib/utils";
import { LIST_SKELETON_COUNT, NEARBY_SCOPE_NOTES, NEARBY_SCOPE_TITLES } from "../constants/distributor.constants";
import { useDistributorProfile } from "../hooks/use-distributor-profile";
import type { useNearbyDistributors } from "../hooks/use-nearby-distributors";
import type { TDistributorProfile, TNearbyDistributor } from "../types/distributor.types";
import { DistributorCard } from "./distributor-card";

export type TDistributorListProps = {
  /** Kết quả `useNearbyDistributors` — dùng chung với map. */
  query: ReturnType<typeof useNearbyDistributors>;
  /** Đang chờ quyền/vị trí từ trình duyệt (query chưa chạy). */
  locating?: boolean;
  /** userId đang chọn (click marker) → highlight + cuộn tới. */
  selectedId?: string | null;
  /** DISTRIBUTOR đang xem: shop của mình ghim đầu danh sách, card shop khác không mở được. */
  ownShopId?: string;
  /** Khối ghi chú đầu danh sách (vd. hướng dẫn bật lại quyền vị trí). */
  notice?: React.ReactNode;
  className?: string;
};

/** Profile → item danh sách (không có khoảng cách); chưa có địa chỉ chính → null (không ghim được). */
const toNearbyItem = ({ id, username, avatar, bussinessType, address }: TDistributorProfile): TNearbyDistributor | null =>
  address ? { userId: id, username, avatar, bussinessType, address, distanceMeters: null } : null;

/** Danh sách distributor (ui-ux.md §6 (7)) — infinite scroll theo page. */
export function DistributorList({
  query,
  locating = false,
  selectedId,
  ownShopId,
  notice,
  className,
}: TDistributorListProps) {
  // Không destructure theo discriminated union: lỗi trang kế cũng làm `status = "error"` nhưng vẫn giữ `data`.
  const { data, refetch, hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage } = query;
  const { data: provinces } = useProvinces();
  const provinceNames = useMemo(
    () => new Map(provinces?.map((province) => [province.codename, province.name])),
    [provinces],
  );

  const loadedOwn = ownShopId ? data?.items.find((item) => item.userId === ownShopId) : undefined;
  // Shop của mình chưa nằm trong các trang đã tải (xa / trang sau) → lấy từ profile để vẫn ghim đầu danh sách.
  const ownProfile = useDistributorProfile(ownShopId ?? "", { enabled: Boolean(ownShopId) && Boolean(data) && !loadedOwn });

  const items = useMemo(() => {
    const all = data?.items ?? [];
    const own = loadedOwn ?? (ownProfile.data ? toNearbyItem(ownProfile.data) : null);
    return own ? [own, ...all.filter((item) => item.userId !== own.userId)] : all;
  }, [data?.items, loadedOwn, ownProfile.data]);

  const itemRefs = useRef(new Map<string, HTMLLIElement>());
  useEffect(() => {
    if (selectedId) itemRefs.current.get(selectedId)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedId]);

  // Sentinel cuối danh sách lọt vào khung nhìn → tải trang kế (không tự tải lại khi trang kế lỗi).
  const sentinelRef = useRef<HTMLLIElement>(null);
  const canLoadMore = hasNextPage && !isFetchingNextPage && !isFetchNextPageError;
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !canLoadMore) return;
    const observer = new IntersectionObserver(([entry]) => entry?.isIntersecting && fetchNextPage(), {
      rootMargin: "200px",
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [canLoadMore, fetchNextPage]);

  if (locating || query.isPending) {
    return (
      <ListFrame className={className} title={locating ? "Đang xác định vị trí của bạn…" : "Đang tải distributor…"}>
        <ul className="flex flex-col gap-2" aria-busy>
          {Array.from({ length: LIST_SKELETON_COUNT }, (_, index) => (
            <li key={index} className="card-normal flex items-center gap-3 rounded-lg border-2 p-3">
              <div className="size-10 shrink-0 animate-pulse rounded-full bg-muted" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
              </div>
            </li>
          ))}
        </ul>
      </ListFrame>
    );
  }

  // Lỗi trang đầu (chưa có data). Lỗi trang kế xử lý ở cuối danh sách.
  if (!data) {
    return (
      <ListFrame className={className} title="Distributor">
        <div role="alert" className="flex flex-col items-center gap-3 py-8 text-center text-sm text-muted-foreground">
          Không tải được danh sách distributor.
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Thử lại
          </Button>
        </div>
      </ListFrame>
    );
  }

  const note = NEARBY_SCOPE_NOTES[data.scope];

  return (
    <ListFrame className={className} title={`${NEARBY_SCOPE_TITLES[data.scope]} (${data.total})`}>
      {notice}
      {note && <p className="mb-2 rounded-md bg-highlight-subtle px-3 py-2 text-xs text-foreground">{note}</p>}
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
          <StoreIcon className="size-8" aria-hidden />
          Chưa có distributor nào.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((distributor) => (
            <li
              key={distributor.userId}
              ref={(node) => {
                if (node) itemRefs.current.set(distributor.userId, node);
                else itemRefs.current.delete(distributor.userId);
              }}
            >
              <DistributorCard
                distributor={distributor}
                provinceName={provinceNames.get(distributor.address.province)}
                selected={distributor.userId === selectedId}
                disabled={Boolean(ownShopId) && distributor.userId !== ownShopId}
              />
            </li>
          ))}
          <li ref={sentinelRef} className="flex justify-center py-2 text-sm text-muted-foreground">
            {isFetchingNextPage && <Loader2Icon className="size-5 animate-spin" aria-label="Đang tải thêm" />}
            {isFetchNextPageError && (
              <Button variant="ghost" size="sm" onClick={() => fetchNextPage()}>
                Tải thêm thất bại — thử lại
              </Button>
            )}
          </li>
        </ul>
      )}
    </ListFrame>
  );
}

function ListFrame({ title, className, children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <section aria-label="Danh sách distributor" className={cn("flex flex-col gap-2", className)}>
      <h2 className="text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}
