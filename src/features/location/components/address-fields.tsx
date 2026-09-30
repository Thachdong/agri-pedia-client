"use client";

import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/atoms";
import { FormField } from "@/shared/components/molecules";
import { cn } from "@/shared/lib/utils";
import { useProvinces } from "../hooks/use-provinces";
import { useWards } from "../hooks/use-wards";
import type { TAddressFieldsErrors, TAddressFieldsValue } from "../types/location.types";
import { LocationPickerField } from "./location-picker-field";

export type TAddressFieldsProps = {
  /** Prefix id cho các control (vd: "address" → "address-province"). */
  idPrefix: string;
  value: TAddressFieldsValue;
  /** Nhận phần thay đổi; đổi tỉnh/thành luôn kèm `ward: ""`. */
  onChange: (patch: Partial<TAddressFieldsValue>) => void;
  /** Gọi khi rời field (để form validate onTouched). */
  onBlur?: (field: keyof TAddressFieldsErrors) => void;
  errors?: TAddressFieldsErrors;
  disabled?: boolean;
  className?: string;
};

function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <p className="flex items-center gap-2 text-xs text-destructive" role="alert">
      {message}
      <Button type="button" variant="link" size="xs" onClick={onRetry}>
        Thử lại
      </Button>
    </p>
  );
}

/** Địa chỉ chính: tỉnh/thành → phường/xã (theo tỉnh) → số nhà → vị trí trên bản đồ. */
export function AddressFields({ idPrefix, value, onChange, onBlur, errors = {}, disabled, className }: TAddressFieldsProps) {
  const provinces = useProvinces();
  const wards = useWards(value.province || undefined);
  const ids = {
    province: `${idPrefix}-province`,
    ward: `${idPrefix}-ward`,
    houseNumber: `${idPrefix}-house-number`,
    location: `${idPrefix}-location`,
  };

  const provincePlaceholder = provinces.isPending ? "Đang tải…" : "Chọn tỉnh/thành phố";
  const wardPlaceholder = !value.province ? "Chọn tỉnh/thành phố trước" : wards.isPending ? "Đang tải…" : "Chọn phường/xã";

  return (
    <fieldset className={cn("flex flex-col gap-4", className)} disabled={disabled}>
      <legend className="mb-2 text-sm font-semibold">Địa chỉ</legend>

      <FormField id={ids.province} label="Tỉnh/Thành phố" error={errors.province} required>
        {(control) => (
          <>
            <Select
              value={value.province}
              onValueChange={(province) => onChange({ province, ward: "" })}
              onOpenChange={(open) => !open && onBlur?.("province")}
              disabled={disabled || !provinces.data}
            >
              <SelectTrigger className="w-full" {...control}>
                <SelectValue placeholder={provincePlaceholder} />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-72">
                {provinces.data?.map((province) => (
                  <SelectItem key={province.codename} value={province.codename}>
                    {province.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {provinces.isError && (
              <LoadError message="Không tải được danh sách tỉnh/thành." onRetry={() => provinces.refetch()} />
            )}
          </>
        )}
      </FormField>

      <FormField id={ids.ward} label="Phường/Xã" error={errors.ward} required>
        {(control) => (
          <>
            <Select
              value={value.ward}
              onValueChange={(ward) => onChange({ ward })}
              onOpenChange={(open) => !open && onBlur?.("ward")}
              disabled={disabled || !value.province || !wards.data}
            >
              <SelectTrigger className="w-full" {...control}>
                <SelectValue placeholder={wardPlaceholder} />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-72">
                {wards.data?.map((ward) => (
                  <SelectItem key={ward.codename} value={ward.codename}>
                    {ward.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {wards.isError && (
              <LoadError message="Không tải được danh sách phường/xã." onRetry={() => wards.refetch()} />
            )}
          </>
        )}
      </FormField>

      <FormField id={ids.houseNumber} label="Số nhà, tên đường" error={errors.houseNumber} required>
        {(control) => (
          <Input
            {...control}
            value={value.houseNumber}
            onChange={(event) => onChange({ houseNumber: event.target.value })}
            onBlur={() => onBlur?.("houseNumber")}
            maxLength={255}
            autoComplete="street-address"
            placeholder="VD: 12 Nguyễn Trãi"
          />
        )}
      </FormField>

      <LocationPickerField
        id={ids.location}
        value={value.lat !== undefined && value.long !== undefined ? { lat: value.lat, long: value.long } : null}
        onChange={({ lat, long }) => onChange({ lat, long })}
        error={errors.location}
        required
        disabled={disabled}
      />
    </fieldset>
  );
}
