"use client";

import { Button } from "@/shared/components/atoms";
import { useInfiniteSentinel } from "@/shared/hooks";
import { cn } from "@/shared/lib/utils";
import type { TProductReview } from "../types/review.types";
import { ReviewItem } from "./review-item";

const SKELETON_COUNT = 3;

type TReviewListItem = TProductReview & { productName?: string | null };

export type TReviewListProps = {
  /** Review đã gộp các trang; `undefined` khi chưa tải xong lần đầu. */
  reviews: TReviewListItem[] | undefined;
  /** Người đang xem — review của họ được highlight. */
  currentUserId?: string;
  isPending: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  fetchNextPage: () => unknown;
  refetch: () => unknown;
  /** Khung cuộn chứa list (vd. body dialog); bỏ trống = viewport. */
  scrollRoot?: Element | null;
  emptyText?: string;
  className?: string;
};

/**
 * Danh sách review (infinite scroll theo sentinel) + trạng thái: skeleton, lỗi (thử lại), rỗng,
 * đang tải trang kế, lỗi trang kế (nút thử lại — không tự gọi lại). Nhận thẳng kết quả infinite query.
 */
export function ReviewList({
  reviews,
  currentUserId,
  isPending,
  hasNextPage,
  isFetchingNextPage,
  isFetchNextPageError,
  fetchNextPage,
  refetch,
  scrollRoot,
  emptyText = "Chưa có đánh giá nào.",
  className,
}: TReviewListProps) {
  const sentinelRef = useInfiniteSentinel<HTMLLIElement>({
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
    root: scrollRoot,
  });

  if (isPending) {
    return (
      <ul className={cn("flex flex-col gap-3", className)} aria-busy aria-label="Đang tải đánh giá">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <li key={index} className="flex gap-3 p-3">
            <div className="size-10 shrink-0 animate-pulse rounded-full bg-muted" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  // Không dùng isError: lỗi trang kế cũng bật isError → list đã có vẫn phải hiện (kèm nút tải thêm).
  if (!reviews) {
    return (
      <div className={cn("flex flex-col items-center gap-2 py-6 text-center text-sm", className)} role="alert">
        <p className="text-muted-foreground">Không tải được đánh giá.</p>
        <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
          Thử lại
        </Button>
      </div>
    );
  }

  if (reviews.length === 0) {
    return <p className={cn("py-6 text-center text-sm text-muted-foreground", className)}>{emptyText}</p>;
  }

  return (
    <ul className={cn("flex flex-col divide-y divide-border-subtle", className)}>
      {reviews.map((review) => (
        <li key={review.id} className="py-2 first:pt-0">
          <ReviewItem review={review} mine={!!currentUserId && review.user.id === currentUserId} />
        </li>
      ))}
      {hasNextPage && (
        <li ref={sentinelRef} className="flex justify-center py-3 text-sm text-muted-foreground">
          {isFetchNextPageError ? (
            <Button type="button" variant="outline" size="sm" onClick={() => fetchNextPage()}>
              Tải thêm đánh giá
            </Button>
          ) : (
            "Đang tải thêm…"
          )}
        </li>
      )}
    </ul>
  );
}
