"use client";

import { Loader2Icon, StoreIcon } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useProvinces } from "@/features/location";
import { Button } from "@/shared/components/atoms";
import { cn } from "@/shared/lib/utils";
import { LIST_SKELETON_COUNT, NEARBY_SCOPE_NOTES, NEARBY_SCOPE_TITLES } from "../constants/distributor.constants";
import type { useNearbyDistributors } from "../hooks/use-nearby-distributors";
import { DistributorCard } from "./distributor-card";

export type TDistributorListProps = {
  /** Kết quả `useNearbyDistributors` — dùng chung với map. */
  query: ReturnType<typeof useNearbyDistributors>;
  /** Đang chờ quyền/vị trí từ trình duyệt (query chưa chạy). */
  locating?: boolean;
  /** userId đang chọn (click marker) → highlight + cuộn tới. */
  selectedId?: string | null;
  className?: string;
};

/** Danh sách distributor (ui-ux.md §6 (7)) — infinite scroll theo page. */
export function DistributorList({ query, locating = false, selectedId, className }: TDistributorListProps) {
  // Không destructure theo discriminated union: lỗi trang kế cũng làm `status = "error"` nhưng vẫn giữ `data`.
  const { data, refetch, hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage } = query;
  const { data: provinces } = useProvinces();
  const provinceNames = useMemo(
    () => new Map(provinces?.map((province) => [province.codename, province.name])),
    [provinces],
  );

  const itemRefs = useRef(new Map<string, HTMLAnchorElement>());
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
      {note && <p className="mb-2 rounded-md bg-highlight-subtle px-3 py-2 text-xs text-foreground">{note}</p>}
      {data.items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
          <StoreIcon className="size-8" aria-hidden />
          Chưa có distributor nào.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {data.items.map((distributor) => (
            <li key={distributor.userId}>
              <DistributorCard
                ref={(node) => {
                  if (node) itemRefs.current.set(distributor.userId, node);
                  else itemRefs.current.delete(distributor.userId);
                }}
                distributor={distributor}
                provinceName={provinceNames.get(distributor.address.province)}
                selected={distributor.userId === selectedId}
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
