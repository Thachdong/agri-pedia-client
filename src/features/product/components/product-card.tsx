import { ImageOffIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/shared/lib/utils";
import { formatPrice } from "@/shared/utils";
import { PRODUCT_UNIT_LABELS } from "../constants/product.constants";
import type { TDistributorProduct } from "../types/product.types";

const quantityFormat = new Intl.NumberFormat("vi-VN");

export type TProductCardProps = Omit<React.ComponentProps<"button">, "children"> & {
  product: TDistributorProduct;
};

/**
 * Card product trong tab "Sản phẩm" (ui-ux.md §7, image-5): tên + giá / đơn vị, số lượng, ảnh đại diện.
 * Là nút — bấm mở chi tiết (M3). List không trả category / mô tả nên card không có 2 field này.
 */
export function ProductCard({ product, className, ...props }: TProductCardProps) {
  const unit = PRODUCT_UNIT_LABELS[product.unit];

  return (
    <button
      type="button"
      aria-label={`Xem chi tiết ${product.name}`}
      className={cn(
        "card-normal flex w-full flex-col overflow-hidden rounded-lg border-2 text-left outline-none transition-colors",
        "hover:border-highlight/50 focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    >
      <div className="flex flex-col gap-1 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 font-semibold">{product.name}</h3>
          <p className="shrink-0 text-sm font-semibold text-highlight">
            {formatPrice(product.price)}
            <span className="font-normal text-muted-foreground"> / {unit}</span>
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Còn {quantityFormat.format(product.quantity)} {unit}
        </p>
      </div>

      <div className="relative aspect-4/3 w-full border-t border-border-subtle bg-muted">
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt=""
            fill
            sizes="(min-width: 640px) 20rem, 100vw"
            unoptimized
            className="object-cover"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-muted-foreground">
            <ImageOffIcon className="size-8" aria-hidden />
          </span>
        )}
      </div>
    </button>
  );
}
