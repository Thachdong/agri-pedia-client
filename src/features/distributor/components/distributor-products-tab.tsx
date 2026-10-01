"use client";

import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import {
  ProductCard,
  ProductDetailDialog,
  ProductFormDialog,
  type TProductDetail,
  useDeleteProduct,
  useDistributorProducts,
} from "@/features/product";
import { ProductReviewsPanel } from "@/features/review";
import type { TUserProfile } from "@/features/user";
import { Button } from "@/shared/components/atoms";
import { ConfirmDialog } from "@/shared/components/molecules";
import { useInfiniteSentinel } from "@/shared/hooks";
import { cn } from "@/shared/lib/utils";

const SKELETON_COUNT = 4;

export type TDistributorProductsTabProps = {
  distributorId: string;
  /** Người đang xem (đã đăng nhập); guest → undefined. */
  viewer?: Pick<TUserProfile, "id" | "role">;
  className?: string;
};

/**
 * Tab "Sản phẩm" của profile (ui-ux.md §7, image-5): grid card product (infinite scroll), bấm card → M3.
 * - Mọi người xem: chi tiết + đánh giá sản phẩm.
 * - FARMER: thêm form đánh giá (M5) / highlight đánh giá của mình.
 * - Owner: nút "Thêm sản phẩm" (M8); trong chi tiết có "Sửa" (M9) / "Xoá" (xác nhận).
 */
export function DistributorProductsTab({ distributorId, viewer, className }: TDistributorProductsTabProps) {
  const isOwner = viewer?.id === distributorId;
  const products = useDistributorProducts(distributorId);
  const deleteProduct = useDeleteProduct(distributorId);
  const sentinelRef = useInfiniteSentinel<HTMLLIElement>(products);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<TProductDetail | null>(null);
  const [deleting, setDeleting] = useState<TProductDetail | null>(null);

  // Sửa: đóng chi tiết trước để không chồng 2 dialog; lưu xong mở lại chi tiết đã cập nhật.
  const startEdit = (product: TProductDetail) => {
    setSelectedId(null);
    setEditing(product);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    deleteProduct.mutate(deleting.id, {
      onSuccess: () => {
        setDeleting(null);
        setSelectedId(null);
      },
    });
  };

  const renderGrid = () => {
    if (products.isPending) {
      return (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy aria-label="Đang tải sản phẩm">
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <li key={index} className="card-normal overflow-hidden rounded-lg border-2">
              <div className="flex flex-col gap-2 p-3">
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
              </div>
              <div className="aspect-4/3 w-full animate-pulse bg-muted" />
            </li>
          ))}
        </ul>
      );
    }

    // Lỗi trang kế cũng bật isError → chỉ coi là lỗi toàn phần khi chưa có data.
    if (!products.data) {
      return (
        <div role="alert" className="flex flex-col items-center gap-2 py-10 text-center text-sm">
          <p className="text-muted-foreground">Không tải được danh sách sản phẩm.</p>
          <Button type="button" variant="outline" size="sm" onClick={() => products.refetch()}>
            Thử lại
          </Button>
        </div>
      );
    }

    if (products.data.length === 0) {
      return (
        <p className="py-10 text-center text-sm text-muted-foreground">
          {isOwner ? "Bạn chưa có sản phẩm nào đang bán. Hãy thêm sản phẩm đầu tiên!" : "Shop chưa có sản phẩm nào."}
        </p>
      );
    }

    return (
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.data.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} onClick={() => setSelectedId(product.id)} className="h-full" />
          </li>
        ))}
        {products.hasNextPage && (
          <li ref={sentinelRef} className="col-span-full flex justify-center py-2 text-sm text-muted-foreground">
            {products.isFetchNextPageError ? (
              <Button type="button" variant="outline" size="sm" onClick={() => products.fetchNextPage()}>
                Tải thêm sản phẩm
              </Button>
            ) : (
              "Đang tải thêm…"
            )}
          </li>
        )}
      </ul>
    );
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {isOwner && (
        <div className="flex justify-end">
          <Button variant="highlight" onClick={() => setCreating(true)}>
            <PlusIcon aria-hidden />
            Thêm sản phẩm
          </Button>
        </div>
      )}

      {renderGrid()}

      {selectedId && (
        <ProductDetailDialog
          open
          onOpenChange={(open) => !open && setSelectedId(null)}
          productId={selectedId}
          renderActions={
            isOwner
              ? (product) => (
                  <>
                    <Button variant="outline" size="sm" onClick={() => startEdit(product)}>
                      <PencilIcon aria-hidden />
                      Sửa
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setDeleting(product)}>
                      <Trash2Icon aria-hidden />
                      Xoá
                    </Button>
                  </>
                )
              : undefined
          }
          renderReviews={(product, scrollRoot) => (
            <ProductReviewsPanel
              key={product.id}
              productId={product.id}
              currentUserId={viewer?.id}
              canReview={viewer?.role === "FARMER" && product.status === "ACTIVE"}
              scrollRoot={scrollRoot}
            />
          )}
        />
      )}

      {isOwner && (
        <ProductFormDialog open={creating} onOpenChange={setCreating} distributorId={distributorId} />
      )}
      {isOwner && editing && (
        <ProductFormDialog
          open
          onOpenChange={(open) => !open && setEditing(null)}
          distributorId={distributorId}
          product={editing}
          onSaved={(productId) => setSelectedId(productId)}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Xoá sản phẩm?"
        description={
          deleting && (
            <>
              <strong className="font-semibold text-foreground">{deleting.name}</strong> sẽ bị xoá khỏi trang của bạn cùng toàn bộ
              ảnh. Không thể hoàn tác.
            </>
          )
        }
        confirmLabel="Xoá"
        destructive
        loading={deleteProduct.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
