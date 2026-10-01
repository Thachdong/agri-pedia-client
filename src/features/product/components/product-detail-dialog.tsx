"use client";

import { useRef } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/atoms";
import { InfoTable, MediaGallery } from "@/shared/components/molecules";
import { isAppError } from "@/shared/lib/http";
import { formatPrice } from "@/shared/utils";
import { PRODUCT_ERROR_CODE, PRODUCT_STATUS_LABELS, PRODUCT_UNIT_LABELS } from "../constants/product.constants";
import { useCategories } from "../hooks/use-categories";
import { useProductDetail } from "../hooks/use-product-detail";
import type { TProductDetail } from "../types/product.types";

const quantityFormat = new Intl.NumberFormat("vi-VN");

export type TProductDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  /** Nút cạnh tên sản phẩm (owner: Sửa / Xoá). */
  renderActions?: (product: TProductDetail) => React.ReactNode;
  /** Phần đánh giá dưới thông tin; `scrollRoot` = khung cuộn của dialog (cho infinite scroll). */
  renderReviews?: (product: TProductDetail, scrollRoot: React.RefObject<HTMLDivElement | null>) => React.ReactNode;
};

/**
 * M3 — chi tiết sản phẩm (ui-ux.md §7): gallery media, tên, giá / đơn vị, số lượng, danh mục, trạng thái, mô tả
 * + slot đánh giá + slot nút. Feature product không phụ thuộc review / user — bên ghép truyền slot.
 */
export function ProductDetailDialog({ open, onOpenChange, productId, renderActions, renderReviews }: TProductDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col gap-0 p-0 sm:max-w-2xl">
        {/* Content unmount khi đóng → mỗi lần mở là product đang chọn. */}
        <ProductDetailBody productId={productId} renderActions={renderActions} renderReviews={renderReviews} />
      </DialogContent>
    </Dialog>
  );
}

type TProductDetailBodyProps = Pick<TProductDetailDialogProps, "productId" | "renderActions" | "renderReviews">;

function ProductDetailBody({ productId, renderActions, renderReviews }: TProductDetailBodyProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const detail = useProductDetail(productId);
  const categories = useCategories();
  const product = detail.data;

  if (!product) {
    const notFound = isAppError(detail.error) && detail.error.code === PRODUCT_ERROR_CODE.NOT_FOUND;
    return (
      <>
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Chi tiết sản phẩm</DialogTitle>
          <DialogDescription className="sr-only">Thông tin và đánh giá của sản phẩm.</DialogDescription>
        </DialogHeader>
        {detail.isPending ? (
          <div className="flex flex-col gap-4 px-6 pb-6" aria-busy aria-label="Đang tải sản phẩm">
            <div className="aspect-4/3 w-full animate-pulse rounded-lg bg-muted" />
            <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-16 w-full animate-pulse rounded bg-muted" />
          </div>
        ) : (
          <div role="alert" className="flex flex-col items-center gap-3 px-6 pb-8 text-center text-sm">
            <p className="text-muted-foreground">
              {notFound ? "Sản phẩm không còn tồn tại." : "Không tải được thông tin sản phẩm."}
            </p>
            {!notFound && (
              <Button type="button" variant="outline" size="sm" onClick={() => detail.refetch()}>
                Thử lại
              </Button>
            )}
          </div>
        )}
      </>
    );
  }

  const unit = PRODUCT_UNIT_LABELS[product.unit];
  const categoryName = categories.data?.find((category) => category.id === product.categoryId)?.name;

  return (
    <>
      <DialogHeader className="border-b border-border-subtle p-6 pb-4 pr-12">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <DialogTitle className="break-words">{product.name}</DialogTitle>
            <DialogDescription className="text-base font-semibold text-highlight">
              {formatPrice(product.price)}
              <span className="font-normal text-muted-foreground"> / {unit}</span>
            </DialogDescription>
          </div>
          {renderActions && <div className="flex shrink-0 gap-2">{renderActions(product)}</div>}
        </div>
      </DialogHeader>

      <div ref={scrollRef} className="scrollbar-thin flex min-h-0 flex-col gap-6 overflow-y-auto p-6">
        <MediaGallery media={product.media} label={product.name} />

        <InfoTable
          items={[
            { label: "Danh mục", value: categoryName ?? (categories.isPending ? "Đang tải…" : undefined) },
            { label: "Số lượng", value: `${quantityFormat.format(product.quantity)} ${unit}` },
            ...(product.status !== "ACTIVE" ? [{ label: "Trạng thái", value: PRODUCT_STATUS_LABELS[product.status] }] : []),
            { label: "Mô tả", value: <p className="break-words whitespace-pre-line">{product.description}</p> },
          ]}
        />

        {renderReviews?.(product, scrollRef)}
      </div>
    </>
  );
}
