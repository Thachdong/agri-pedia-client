"use client";

import { useState } from "react";
import { useProductReviews } from "../hooks/use-product-reviews";
import { useReviewSummary } from "../hooks/use-review-summary";
import { RatingSummary } from "./rating-summary";
import { ReviewForm } from "./review-form";
import { ReviewItem } from "./review-item";
import { ReviewList } from "./review-list";

export type TProductReviewsPanelProps = {
  productId: string;
  /** Người đang xem (đã đăng nhập) — review của họ được ghim lên đầu + highlight. */
  currentUserId?: string;
  /** Được phép đánh giá: FARMER và product đang ACTIVE (server từ chối product khác ACTIVE). */
  canReview?: boolean;
  /** Khung cuộn chứa panel (body dialog) — cho infinite scroll. */
  scrollRoot?: React.RefObject<Element | null>;
  className?: string;
};

/**
 * Đánh giá của 1 sản phẩm (trong dialog chi tiết M3): tổng quan sao + danh sách (infinite scroll).
 * Farmer: đã có review của mình (trong các trang đã tải) → ghim lên đầu, highlight; chưa có → form M5 inline.
 * Review ở trang chưa tải → form vẫn hiện, gửi sẽ nhận 409 và form tự khoá + thông báo.
 */
export function ProductReviewsPanel({ productId, currentUserId, canReview = false, scrollRoot, className }: TProductReviewsPanelProps) {
  const summary = useReviewSummary({ targetType: "PRODUCT", targetId: productId });
  const reviews = useProductReviews(productId);
  // Vừa gửi xong → ẩn form ngay, không chờ list refetch.
  const [submitted, setSubmitted] = useState(false);

  const mine = currentUserId ? reviews.data?.find((review) => review.user.id === currentUserId) : undefined;
  const others = mine ? reviews.data?.filter((review) => review.id !== mine.id) : reviews.data;
  const showForm = canReview && !mine && !submitted && reviews.isSuccess;

  return (
    <section aria-labelledby={`product-reviews-${productId}`} className={className}>
      <h3 id={`product-reviews-${productId}`} className="mb-3 text-base font-semibold">
        Đánh giá sản phẩm
      </h3>

      <div className="flex flex-col gap-4">
        {summary.data ? (
          <RatingSummary summary={summary.data} />
        ) : summary.isPending ? (
          <div className="h-28 animate-pulse rounded-lg bg-muted" aria-busy aria-label="Đang tải tổng quan đánh giá" />
        ) : null}

        {mine && <ReviewItem review={mine} mine />}

        {showForm && (
          <div className="rounded-lg border border-border-subtle p-3">
            <p className="mb-3 text-sm font-medium">Viết đánh giá của bạn</p>
            <ReviewForm
              id={`review-product-${productId}`}
              targetType="PRODUCT"
              targetId={productId}
              onSuccess={() => setSubmitted(true)}
            />
          </div>
        )}

        <ReviewList
          reviews={others}
          currentUserId={currentUserId}
          isPending={reviews.isPending}
          isError={reviews.isError}
          hasNextPage={reviews.hasNextPage}
          isFetchingNextPage={reviews.isFetchingNextPage}
          isFetchNextPageError={reviews.isFetchNextPageError}
          fetchNextPage={reviews.fetchNextPage}
          refetch={reviews.refetch}
          scrollRoot={scrollRoot}
          emptyText={mine ? "Chưa có đánh giá nào khác." : "Sản phẩm chưa có đánh giá nào."}
        />
      </div>
    </section>
  );
}
