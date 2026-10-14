"use client";

import { useId } from "react";
import { RadioGroup, RadioGroupItem } from "@/shared/components/atoms";
import { cn } from "@/shared/lib/utils";
import { type TAddressCodes, useAddressLabel } from "../hooks/use-address-label";

export type TAddressRadioItem = TAddressCodes & { id: string };

export type TAddressRadioListProps<T extends TAddressRadioItem> = {
  addresses: T[];
  /** Id address đang chọn (primary). */
  value: string | undefined;
  onValueChange: (addressId: string) => void;
  /** Nút cạnh từng dòng (vd: xoá) — nằm ngoài label nên bấm không đổi lựa chọn. */
  renderAction?: (address: T, checked: boolean) => React.ReactNode;
  disabled?: boolean;
  emptyText?: string;
  "aria-label"?: string;
  className?: string;
};

/**
 * Danh sách address dạng radio (tên tỉnh/xã tra từ codename) — chọn 1 dòng = chọn địa chỉ mặc định.
 * Dòng đang chọn có badge "Mặc định". Gọi API là việc của bên dùng.
 */
export function AddressRadioList<T extends TAddressRadioItem>({
  addresses,
  value,
  onValueChange,
  renderAction,
  disabled,
  emptyText = "Chưa có địa chỉ",
  "aria-label": ariaLabel = "Chọn địa chỉ mặc định",
  className,
}: TAddressRadioListProps<T>) {
  const idPrefix = useId();
  if (addresses.length === 0) return <span className="text-muted-foreground">{emptyText}</span>;

  return (
    <RadioGroup
      value={value ?? ""}
      onValueChange={onValueChange}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn("gap-1", className)}
    >
      {addresses.map((address) => {
        const checked = address.id === value;
        return (
          <AddressRadioRow
            key={address.id}
            id={`${idPrefix}-${address.id}`}
            address={address}
            checked={checked}
            disabled={disabled}
            action={renderAction?.(address, checked)}
          />
        );
      })}
    </RadioGroup>
  );
}

type TAddressRadioRowProps = {
  id: string;
  address: TAddressRadioItem;
  checked: boolean;
  disabled?: boolean;
  action?: React.ReactNode;
};

function AddressRadioRow({ id, address, checked, disabled, action }: TAddressRadioRowProps) {
  const label = useAddressLabel(address);
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border border-transparent px-2 py-1.5",
        checked && "border-border-subtle bg-highlight-subtle/50",
      )}
    >
      <RadioGroupItem id={id} value={address.id} className="mt-0.5 self-start" />
      <label
        htmlFor={id}
        className={cn("min-w-0 flex-1 text-sm", disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer")}
      >
        {label}
        {checked && (
          <span className="ml-2 inline-flex items-center rounded-md bg-highlight-subtle px-1.5 py-0.5 align-middle text-xs font-medium text-highlight">
            Mặc định
          </span>
        )}
      </label>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
