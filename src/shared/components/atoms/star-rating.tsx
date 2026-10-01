import { cva } from "class-variance-authority";
import { StarIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const starSizeVariants = cva("", {
  variants: { size: { xs: "size-3.5", sm: "size-4", md: "size-5" } },
  defaultVariants: { size: "sm" },
});

const ratingFormat = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 });

export type TStarRatingProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** Điểm 0..max, có thể lẻ (vd. 4.3 → sao thứ 5 tô 30%). */
  value: number;
  max?: number;
  size?: "xs" | "sm" | "md";
};

/**
 * Hiển thị sao (chỉ đọc) — 1 nhãn cho screen reader ("4,3 trên 5 sao"), sao là đồ hoạ.
 * Sao lẻ: lớp sao đầy cắt theo phần trăm đè lên sao trống. Màu từ token `rating` / `rating-muted`.
 */
export function StarRating({ value, max = 5, size, className, ...props }: TStarRatingProps) {
  const clamped = Math.min(Math.max(value, 0), max);

  return (
    <span
      role="img"
      aria-label={`${ratingFormat.format(clamped)} trên ${max} sao`}
      className={cn("inline-flex items-center gap-0.5", className)}
      {...props}
    >
      {Array.from({ length: max }, (_, index) => {
        const fill = Math.min(Math.max(clamped - index, 0), 1);
        return (
          <span key={index} className="relative inline-flex shrink-0">
            <StarIcon aria-hidden className={cn(starSizeVariants({ size }), "fill-transparent text-rating-muted")} />
            {fill > 0 && (
              <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <StarIcon aria-hidden className={cn(starSizeVariants({ size }), "fill-rating text-rating")} />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
