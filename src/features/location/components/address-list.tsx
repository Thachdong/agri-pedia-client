"use client";

import { MapPinIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { type TAddressCodes, useAddressLabel } from "../hooks/use-address-label";

export type TAddressListItem = TAddressCodes & { id?: string; isPrimary?: boolean };

export type TAddressListProps = Omit<React.ComponentProps<"ul">, "children"> & {
  addresses: TAddressListItem[];
  emptyText?: string;
};

/**
 * Danh sách địa chỉ (tên tỉnh/xã tra từ codename). Badge "Mặc định" chỉ hiện khi có từ 2 địa chỉ
 * — một địa chỉ duy nhất thì không cần phân biệt.
 */
export function AddressList({ addresses, emptyText = "Chưa có địa chỉ", className, ...props }: TAddressListProps) {
  if (addresses.length === 0) return <span className="text-muted-foreground">{emptyText}</span>;

  const showPrimary = addresses.length > 1;
  return (
    <ul className={cn("flex flex-col gap-1.5", className)} {...props}>
      {addresses.map((address, index) => (
        <AddressLine
          key={address.id ?? index}
          address={address}
          primary={showPrimary && Boolean(address.isPrimary)}
        />
      ))}
    </ul>
  );
}

function AddressLine({ address, primary }: { address: TAddressCodes; primary: boolean }) {
  const label = useAddressLabel(address);
  return (
    <li className="flex items-start gap-1.5">
      <MapPinIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      <span className="min-w-0">
        {label}
        {primary && (
          <span className="ml-2 inline-flex items-center rounded-md bg-highlight-subtle px-1.5 py-0.5 align-middle text-xs font-medium text-highlight">
            Mặc định
          </span>
        )}
      </span>
    </li>
  );
}
