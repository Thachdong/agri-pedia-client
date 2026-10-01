"use client";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/atoms";
import { ReviewForm } from "./review-form";

export type TReviewShopDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  distributorId: string;
  distributorName: string;
  /** Gửi thành công, hoặc server báo đã review từ trước — bên gọi nên ẩn/khoá nút "Đánh giá". */
  onReviewed?: () => void;
};

const FORM_ID = "review-shop-form";

/**
 * M4 — đánh giá shop (ui-ux.md §7): ReviewForm targetType USER trong dialog.
 * Form nằm trong DialogContent → đóng dialog là unmount, mở lại có form sạch.
 * Thành công → đóng dialog; 409 (đã review) → giữ dialog + thông báo, nút "Huỷ" thành "Đóng".
 */
export function ReviewShopDialog({ open, onOpenChange, distributorId, distributorName, onReviewed }: TReviewShopDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Đánh giá shop</DialogTitle>
          <DialogDescription>Chia sẻ trải nghiệm của bạn với {distributorName}.</DialogDescription>
        </DialogHeader>

        <ReviewForm
          id={FORM_ID}
          targetType="USER"
          targetId={distributorId}
          onSuccess={() => {
            onReviewed?.();
            onOpenChange(false);
          }}
          onAlreadyReviewed={onReviewed}
          renderActions={({ submitting, alreadyReviewed }) => (
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {alreadyReviewed ? "Đóng" : "Huỷ"}
              </Button>
              <Button type="submit" form={FORM_ID} variant="highlight" loading={submitting} disabled={alreadyReviewed}>
                Gửi đánh giá
              </Button>
            </DialogFooter>
          )}
        />
      </DialogContent>
    </Dialog>
  );
}
