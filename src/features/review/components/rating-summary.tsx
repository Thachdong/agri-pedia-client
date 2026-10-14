import { StarIcon } from "lucide-react";
import { StarRating } from "@/shared/components/atoms";
import { cn } from "@/shared/lib/utils";
import type { TReviewSummary } from "../types/review.types";

const ratingFormat = new Intl.NumberFormat("vi-VN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const countFormat = new Intl.NumberFormat("vi-VN");

// 5 sao trên cùng (quen thuộc hơn thứ tự 1 → 5 của wireframe).
const STAR_LEVELS = [5, 4, 3, 2, 1] as const;

export type TRatingSummaryProps = Omit<React.ComponentProps<"section">, "children"> & {
  summary: TReviewSummary;
};

/**
 * Tổng quan đánh giá (ui-ux.md §7, image-6): điểm trung bình / 5 + tổng số đánh giá,
 * và số lượng từng mức 1 ~ 5 sao kèm thanh tỉ lệ.
 */
export function RatingSummary({ summary, className, ...props }: TRatingSummaryProps) {
  const { avgRating, reviewCount, starCounts } = summary;

  return (
    <section
      aria-label="Tổng quan đánh giá"
      className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8", className)}
      {...props}
    >
      <div className="flex shrink-0 flex-col items-center gap-1 sm:w-36">
        <p className="text-4xl font-bold">
          {ratingFormat.format(avgRating)}
          <span className="text-base font-normal text-muted-foreground"> / 5</span>
        </p>
        <StarRating value={avgRating} size="md" />
        <p className="text-sm text-muted-foreground">{countFormat.format(reviewCount)} đánh giá</p>
      </div>

      <ul className="flex flex-1 flex-col gap-1.5">
        {STAR_LEVELS.map((level) => {
          const count = starCounts[level];
          const percent = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
          return (
            <li key={level} className="flex items-center gap-2 text-sm">
              <span className="flex w-10 shrink-0 items-center gap-0.5 text-muted-foreground" aria-hidden>
                {level}
                <StarIcon className="size-3.5 fill-rating text-rating" aria-hidden />
              </span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden>
                <span className="block h-full rounded-full bg-rating" style={{ width: `${percent}%` }} />
              </span>
              <span className="w-10 shrink-0 text-right tabular-nums" aria-hidden>{countFormat.format(count)}</span>
              <span className="sr-only">
                {level} sao: {countFormat.format(count)} đánh giá
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
