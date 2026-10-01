"use client";

import { cn } from "@/shared/lib/utils";
import { useDistributorReviews } from "../hooks/use-distributor-reviews";
import { RatingSummary } from "./rating-summary";
import { ReviewList } from "./review-list";

export type TShopReviewsPanelProps = {
  distributorId: string;
  /** Người đang xem (đã đăng nhập) — review của họ được highlight "Đánh giá của bạn". */
  currentUserId?: string;
  className?: string;
};

/**
 * Tab "Đánh giá" của profile (ui-ux.md §7, image-6): tổng quan sao cả shop (shop + sản phẩm)
 * + danh sách review shop lẫn review sản phẩm (kèm tên sản phẩm), mới nhất trước, infinite scroll.
 * Farmer có thể có nhiều review (shop + từng sản phẩm) → highlight tại chỗ, không ghim.
 */
export function ShopReviewsPanel({ distributorId, currentUserId, className }: TShopReviewsPanelProps) {
  const query = useDistributorReviews({ distributorId });

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {query.data ? (
        <RatingSummary summary={query.data.summary} className="border-b border-border-subtle pb-6" />
      ) : query.isPending ? (
        <div className="h-32 animate-pulse rounded-lg bg-muted" aria-busy aria-label="Đang tải tổng quan đánh giá" />
      ) : null}

      <ReviewList
        reviews={query.data?.reviews}
        currentUserId={currentUserId}
        isPending={query.isPending}
        isError={query.isError}
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        isFetchNextPageError={query.isFetchNextPageError}
        fetchNextPage={query.fetchNextPage}
        refetch={query.refetch}
        emptyText="Shop chưa có đánh giá nào."
      />
    </div>
  );
}
