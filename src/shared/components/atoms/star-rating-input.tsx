"use client";

import { cva } from "class-variance-authority";
import { StarIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/utils";

const starVariants = cva("transition-colors", {
  variants: {
    size: { sm: "size-5", md: "size-7", lg: "size-9" },
    filled: { true: "fill-rating text-rating", false: "fill-transparent text-rating-muted" },
  },
  defaultVariants: { size: "md", filled: false },
});

export type TStarRatingInputProps = Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> & {
  /** Số sao đang chọn; 0 = chưa chọn. */
  value: number;
  onChange: (value: number) => void;
  /** `name` chung cho nhóm radio. */
  name: string;
  max?: number;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
};

/**
 * Chọn số sao 1..max. Radio thật (ẩn) → Tab vào nhóm, mũi tên đổi sao, screen reader đọc "x sao".
 * Rê chuột xem trước; màu sao từ token `rating` / `rating-muted`.
 */
export function StarRatingInput({
  value,
  onChange,
  name,
  max = 5,
  disabled = false,
  size = "md",
  className,
  "aria-label": ariaLabel = "Số sao",
  ...props
}: TStarRatingInputProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const shown = disabled ? value : (hovered ?? value);

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      className={cn("inline-flex items-center gap-0.5", disabled && "opacity-60", className)}
      onMouseLeave={() => setHovered(null)}
      {...props}
    >
      {Array.from({ length: max }, (_, index) => {
        const star = index + 1;
        return (
          <label
            key={star}
            onMouseEnter={() => setHovered(star)}
            className={cn(
              "rounded-sm p-0.5 has-focus-visible:ring-2 has-focus-visible:ring-ring",
              disabled ? "cursor-not-allowed" : "cursor-pointer",
            )}
          >
            <input
              type="radio"
              name={name}
              value={star}
              checked={value === star}
              onChange={() => onChange(star)}
              disabled={disabled}
              aria-label={`${star} sao`}
              className="sr-only"
            />
            <StarIcon aria-hidden className={starVariants({ size, filled: star <= shown })} />
          </label>
        );
      })}
    </div>
  );
}
