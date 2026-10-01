"use client";

import { cn } from "@/shared/lib/utils";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../atoms";

export type TConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Hành động không hoàn tác (xoá...) → nút xác nhận màu destructive. */
  destructive?: boolean;
  /** Đang chạy hành động → spinner + khoá đóng dialog. */
  loading?: boolean;
  /** Lỗi của lần xác nhận trước (bên gọi giữ dialog mở để thử lại). */
  error?: string;
  className?: string;
};

/** Hộp xác nhận 1 hành động (vd. "Xoá sản phẩm?"). Bên gọi tự đóng dialog khi hành động thành công. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmLabel = "Xác nhận",
  cancelLabel = "Huỷ",
  destructive = false,
  loading = false,
  error,
  className,
}: TConfirmDialogProps) {
  const handleOpenChange = (next: boolean) => {
    if (!loading) onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={cn("sm:max-w-sm", className)} showCloseButton={!loading}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button type="button" variant={destructive ? "destructive" : "highlight"} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
