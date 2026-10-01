import { cva } from "class-variance-authority";
import { PackageIcon } from "lucide-react";
import { Avatar, StarRating } from "@/shared/components/atoms";
import { cn } from "@/shared/lib/utils";
import { formatRelativeTime } from "@/shared/utils";
import type { TProductReview } from "../types/review.types";

const DELETED_USER_NAME = "Người dùng không còn tồn tại";

const reviewItemVariants = cva("flex gap-3 rounded-lg p-3", {
  variants: {
    mine: {
      true: "card-highlight bg-highlight-subtle",
      false: "",
    },
  },
  defaultVariants: { mine: false },
});

export type TReviewItemProps = Omit<React.ComponentProps<"article">, "children"> & {
  /** Review shop / product (GET /reviews) hoặc review của 1 product (GET /reviews/products/:id). */
  review: TProductReview & { productName?: string | null };
  /** Review của người đang xem → highlight + nhãn "Đánh giá của bạn". */
  mine?: boolean;
};

/**
 * 1 review (ui-ux.md §7, image-6): avatar + username, sao, nội dung, thời gian "x giờ/ngày… trước".
 * Review sản phẩm trong tab "Đánh giá" kèm tên sản phẩm.
 */
export function ReviewItem({ review, mine = false, className, ...props }: TReviewItemProps) {
  const name = review.user.username ?? DELETED_USER_NAME;

  return (
    <article className={cn(reviewItemVariants({ mine }), className)} {...props}>
      <Avatar src={review.user.avatar} name={name} className="size-10 shrink-0" />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className={cn("truncate font-semibold", !review.user.username && "text-muted-foreground italic")}>
            {name}
          </span>
          {mine && (
            <span className="rounded-md bg-highlight px-2 py-0.5 text-xs font-medium text-highlight-foreground">
              Đánh giá của bạn
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <StarRating value={review.star} size="xs" />
          {/* Thời gian tương đối tính theo giờ hiện tại → server / client có thể lệch vài giây. */}
          <time dateTime={review.createdAt} title={new Date(review.createdAt).toLocaleString("vi-VN")} suppressHydrationWarning>
            {formatRelativeTime(review.createdAt)}
          </time>
        </div>

        {review.productName && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <PackageIcon className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">Sản phẩm: {review.productName}</span>
          </p>
        )}

        <p className="text-sm break-words whitespace-pre-line">{review.content}</p>
      </div>
    </article>
  );
}
