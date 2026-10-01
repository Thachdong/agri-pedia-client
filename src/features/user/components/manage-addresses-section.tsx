"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { useAddressLabel } from "@/features/location";
import { Button } from "@/shared/components/atoms";
import { ConfirmDialog } from "@/shared/components/molecules";
import { isAppError } from "@/shared/lib/http";
import { toast } from "@/shared/lib/toast";
import { cn } from "@/shared/lib/utils";
import { ADDRESS_ERROR_MESSAGES } from "../constants/address.constants";
import { useDeleteMyAddress } from "../hooks/use-delete-my-address";
import type { TMyAddress } from "../types/user.types";
import { AddAddressDialog } from "./add-address-dialog";
import { PrimaryAddressPicker } from "./primary-address-picker";

export type TManageAddressesSectionProps = {
  /** Id người đang đăng nhập. */
  userId: string;
  className?: string;
};

/**
 * M7 — quản lý address ngay trên trang profile (ô "Địa chỉ" của bảng thông tin, chỉ chủ profile):
 * radio đặt mặc định (xác nhận), xoá (xác nhận), "Thêm địa chỉ" (dialog). Mỗi thao tác gọi API riêng.
 * Address mặc định không xoá được (server 409). Nhãn "Địa chỉ" do bảng hiển thị nên không có tiêu đề riêng.
 */
export function ManageAddressesSection({ userId, className }: TManageAddressesSectionProps) {
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<TMyAddress | null>(null);
  const deleteAddress = useDeleteMyAddress();

  const openDelete = (address: TMyAddress) => {
    deleteAddress.reset();
    setDeleting(address);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    deleteAddress.mutate(deleting.id, {
      onSuccess: () => {
        toast.success("Đã xoá địa chỉ");
        setDeleting(null);
      },
    });
  };

  const deleteError = deleteAddress.error
    ? ((isAppError(deleteAddress.error) && ADDRESS_ERROR_MESSAGES[deleteAddress.error.code]) ||
      "Không xoá được địa chỉ, vui lòng thử lại.")
    : undefined;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <PrimaryAddressPicker
        userId={userId}
        disabled={deleteAddress.isPending}
        renderAction={(address, checked) => (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => openDelete(address)}
            disabled={checked || deleteAddress.isPending}
            aria-label="Xoá địa chỉ"
            title={checked ? "Không thể xoá địa chỉ mặc định" : "Xoá địa chỉ"}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2Icon aria-hidden />
          </Button>
        )}
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">Chọn để đổi địa chỉ mặc định. Địa chỉ mặc định không xoá được.</p>
        <Button type="button" variant="outline" size="sm" onClick={() => setAdding(true)}>
          <PlusIcon aria-hidden />
          Thêm địa chỉ
        </Button>
      </div>

      <AddAddressDialog open={adding} onOpenChange={setAdding} userId={userId} />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Xoá địa chỉ?"
        description={<DeletingAddressLabel address={deleting} />}
        onConfirm={confirmDelete}
        confirmLabel="Xoá"
        destructive
        loading={deleteAddress.isPending}
        error={deleteError}
      />
    </div>
  );
}

function DeletingAddressLabel({ address }: { address: TMyAddress | null }) {
  const label = useAddressLabel(address);
  return label ? `Địa chỉ "${label}" sẽ bị xoá khỏi tài khoản.` : null;
}
