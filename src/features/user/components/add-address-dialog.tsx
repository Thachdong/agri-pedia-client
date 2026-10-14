"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/atoms";
import { AddAddressForm } from "./add-address-form";

export type TAddAddressDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Id người đang đăng nhập. */
  userId: string;
};

/** Dialog thêm address (M7) mở từ trang profile — thêm xong / huỷ → đóng. Content unmount khi đóng → mỗi lần mở là form trống. */
export function AddAddressDialog({ open, onOpenChange, userId }: TAddAddressDialogProps) {
  const close = () => onOpenChange(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Thêm địa chỉ</DialogTitle>
          <DialogDescription>Địa chỉ mới là địa chỉ thường — chọn trong danh sách để đặt làm mặc định.</DialogDescription>
        </DialogHeader>
        <div className="scrollbar-thin -mx-1 min-h-0 overflow-y-auto px-1 pb-1">
          <AddAddressForm userId={userId} onDone={close} onCancel={close} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
