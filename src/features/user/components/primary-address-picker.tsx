"use client";

import { useState } from "react";
import { AddressRadioList, type TAddressRadioListProps, useAddressLabel } from "@/features/location";
import { Button } from "@/shared/components/atoms";
import { ConfirmDialog } from "@/shared/components/molecules";
import { isAppError } from "@/shared/lib/http";
import { toast } from "@/shared/lib/toast";
import { cn } from "@/shared/lib/utils";
import { ADDRESS_ERROR_MESSAGES } from "../constants/address.constants";
import { useMyAddresses } from "../hooks/use-my-addresses";
import { useSetMyPrimaryAddress } from "../hooks/use-set-my-primary-address";
import type { TMyAddress } from "../types/user.types";

export type TPrimaryAddressPickerProps = {
  /** Id người đang đăng nhập (chủ profile). */
  userId: string;
  /** Nút cạnh từng dòng (vd: xoá). */
  renderAction?: TAddressRadioListProps<TMyAddress>["renderAction"];
  /** Khoá radio từ bên ngoài (vd: đang xoá một address). */
  disabled?: boolean;
  className?: string;
};

/**
 * Address của chính mình dạng radio — chọn dòng khác → xác nhận → PATCH primary.
 * Radio chỉ đổi khi đã xác nhận (đang gửi: hiện lựa chọn mới + khoá); huỷ / lỗi → giữ primary cũ, lỗi hiện trong hộp xác nhận.
 */
export function PrimaryAddressPicker({ userId, renderAction, disabled, className }: TPrimaryAddressPickerProps) {
  const addresses = useMyAddresses();
  const setPrimary = useSetMyPrimaryAddress(userId);
  const [target, setTarget] = useState<TMyAddress | null>(null);

  if (addresses.isPending) return <AddressPickerSkeleton className={className} />;
  if (addresses.isError) {
    return (
      <p role="alert" className={cn("flex flex-wrap items-center gap-2 text-sm text-muted-foreground", className)}>
        Không tải được danh sách địa chỉ.
        <Button type="button" variant="link" size="xs" onClick={() => addresses.refetch()}>
          Thử lại
        </Button>
      </p>
    );
  }

  const primaryId = addresses.data.find((address) => address.isPrimary)?.id;
  // Invalidate được chờ trong mutation → hết pending là list đã tải lại, không nháy về lựa chọn cũ.
  const value = setPrimary.isPending ? setPrimary.variables : primaryId;

  const select = (addressId: string) => {
    if (addressId === primaryId) return;
    setPrimary.reset();
    setTarget(addresses.data.find((address) => address.id === addressId) ?? null);
  };

  const confirm = () => {
    if (!target) return;
    setPrimary.mutate(target.id, {
      onSuccess: () => {
        toast.success("Đã đổi địa chỉ mặc định");
        setTarget(null);
      },
    });
  };

  const error = setPrimary.error
    ? (isAppError(setPrimary.error) && ADDRESS_ERROR_MESSAGES[setPrimary.error.code]) ||
      "Không đổi được địa chỉ mặc định, vui lòng thử lại."
    : undefined;

  return (
    <>
      <AddressRadioList
        addresses={addresses.data}
        value={value}
        onValueChange={select}
        renderAction={renderAction}
        disabled={disabled || setPrimary.isPending}
        className={className}
      />
      <ConfirmDialog
        open={target !== null}
        onOpenChange={(open) => !open && setTarget(null)}
        title="Đặt làm địa chỉ mặc định?"
        description={<TargetAddressLabel address={target} />}
        onConfirm={confirm}
        confirmLabel="Đặt mặc định"
        loading={setPrimary.isPending}
        error={error}
      />
    </>
  );
}

function TargetAddressLabel({ address }: { address: TMyAddress | null }) {
  const label = useAddressLabel(address);
  return label ? `"${label}" sẽ trở thành địa chỉ mặc định của bạn.` : null;
}

function AddressPickerSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2", className)} aria-busy aria-label="Đang tải địa chỉ">
      {[0, 1].map((index) => (
        <div key={index} className="flex items-center gap-2 px-2 py-1.5">
          <div className="size-4 animate-pulse rounded-full bg-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
