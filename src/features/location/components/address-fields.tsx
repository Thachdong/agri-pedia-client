"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/atoms";
import { ConfirmDialog, FormField } from "@/shared/components/molecules";
import type { TCoordinates } from "@/shared/hooks";
import { cn } from "@/shared/lib/utils";
import { useProvinces } from "../hooks/use-provinces";
import { type TResolvedAddress, useResolveAddress } from "../hooks/use-resolve-address";
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

/*
 * `onValueChange` bỏ qua "": Radix Select trong <form> đồng bộ value sang <select> native ẩn rồi phát "change".
 * Đổi tỉnh + xã cùng lúc (điền theo vị trí) thì lúc đó <select> xã còn option của tỉnh cũ → value đọc ra ""
 * → Radix báo đổi thành "" và xoá mất xã vừa điền. Danh sách không có item rỗng nên "" chỉ đến từ đây.
 */

function MismatchHint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-warning">{children}</p>;
}

type TFillPatch = Partial<Pick<TAddressFieldsValue, "province" | "ward" | "houseNumber">>;

/** Phần địa chỉ cần đổi theo vị trí — chỉ field suy ra được và khác giá trị hiện tại. Đổi tỉnh luôn kèm xã. */
function toFillPatch(current: TAddressFieldsValue, resolved: TResolvedAddress): TFillPatch {
  const patch: TFillPatch = {};
  const { province, ward, street } = resolved;
  if (province && province.codename !== current.province) {
    patch.province = province.codename;
    patch.ward = ward?.codename ?? "";
  } else if (ward && ward.codename !== current.ward) {
    patch.ward = ward.codename;
  }
  if (street && street !== current.houseNumber) patch.houseNumber = street;
  return patch;
}

/**
 * Địa chỉ chính: vị trí trên bản đồ → tỉnh/thành → phường/xã (theo tỉnh) → số nhà.
 * Chọn vị trí → tự điền tỉnh/xã/số nhà suy ra được (reverse geocode); field đã có giá trị
 * mà bị đổi thì hỏi xác nhận trước. User vẫn sửa tay được, lệch với vị trí thì cảnh báo.
 */
export function AddressFields({ idPrefix, value, onChange, onBlur, errors = {}, disabled, className }: TAddressFieldsProps) {
  const provinces = useProvinces();
  const wards = useWards(value.province || undefined);
  const resolveAddress = useResolveAddress();
  /** Địa chỉ suy ra từ vị trí đang chọn — `null` khi chưa chọn trong phiên này hoặc không suy ra được. */
  const [located, setLocated] = useState<TResolvedAddress | null>(null);
  const [pendingFill, setPendingFill] = useState<TFillPatch | null>(null);
  const [resolveStatus, setResolveStatus] = useState<"idle" | "loading" | "failed">("idle");
  // Lấy giá trị mới nhất sau await (user có thể sửa form trong lúc chờ) + bỏ kết quả của lần chọn cũ.
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  });
  const requestRef = useRef(0);

  const changeLocation = async (coords: TCoordinates) => {
    onChange(coords);
    const request = ++requestRef.current;
    setResolveStatus("loading");
    const resolved = await resolveAddress(coords).catch(() => null);
    if (request !== requestRef.current) return;

    setLocated(resolved?.province ? resolved : null);
    setResolveStatus(resolved?.province ? "idle" : "failed");
    if (!resolved) return;

    const current = valueRef.current;
    const patch = toFillPatch(current, resolved);
    const overwrites = (Object.keys(patch) as (keyof TFillPatch)[]).some((key) => current[key]);
    if (overwrites) setPendingFill(patch);
    else if (Object.keys(patch).length > 0) onChange(patch);
  };

  const confirmFill = () => {
    if (pendingFill) onChange(pendingFill);
    setPendingFill(null);
  };

  const provinceMismatch = Boolean(located?.province && value.province && value.province !== located.province.codename);
  const wardMismatch = Boolean(
    !provinceMismatch && located?.ward && value.ward && value.ward !== located.ward.codename,
  );
  const ids = {
    province: `${idPrefix}-province`,
    ward: `${idPrefix}-ward`,
    houseNumber: `${idPrefix}-house-number`,
    location: `${idPrefix}-location`,
  };

  const provincePlaceholder = provinces.isPending ? "Đang tải…" : "Chọn tỉnh/thành phố";
  const wardPlaceholder = !value.province ? "Chọn tỉnh/thành phố trước" : wards.isPending ? "Đang tải…" : "Chọn phường/xã";

  return (
    <fieldset className={cn("flex min-w-0 flex-col gap-4", className)} disabled={disabled}>
      <legend className="mb-2 text-sm font-semibold">Địa chỉ</legend>

      <div className="flex flex-col gap-1">
        <LocationPickerField
          id={ids.location}
          value={value.lat !== undefined && value.long !== undefined ? { lat: value.lat, long: value.long } : null}
          onChange={changeLocation}
          error={errors.location}
          required
          disabled={disabled}
        />
        {resolveStatus === "loading" && (
          <p className="text-xs text-muted-foreground" aria-live="polite">
            Đang xác định địa chỉ từ vị trí…
          </p>
        )}
        {resolveStatus === "failed" && (
          <p className="text-xs text-muted-foreground" aria-live="polite">
            Không tự điền được địa chỉ từ vị trí này, vui lòng chọn tỉnh/thành, phường/xã.
          </p>
        )}
      </div>

      <FormField id={ids.province} label="Tỉnh/Thành phố" error={errors.province} required>
        {(control) => (
          <>
            <Select
              value={value.province}
              onValueChange={(province) => province && onChange({ province, ward: "" })}
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
            {provinceMismatch && (
              <MismatchHint>Vị trí trên bản đồ thuộc {located?.province?.name}, khác tỉnh/thành đã chọn.</MismatchHint>
            )}
          </>
        )}
      </FormField>

      <FormField id={ids.ward} label="Phường/Xã" error={errors.ward} required>
        {(control) => (
          <>
            <Select
              value={value.ward}
              onValueChange={(ward) => ward && onChange({ ward })}
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
            {wardMismatch && (
              <MismatchHint>Vị trí trên bản đồ thuộc {located?.ward?.name}, khác phường/xã đã chọn.</MismatchHint>
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

      <ConfirmDialog
        open={pendingFill !== null}
        onOpenChange={(open) => !open && setPendingFill(null)}
        title="Cập nhật địa chỉ theo vị trí?"
        description={<FillSummary patch={pendingFill} resolved={located} />}
        onConfirm={confirmFill}
        confirmLabel="Cập nhật"
        cancelLabel="Giữ nguyên"
      />
    </fieldset>
  );
}

/** Nội dung dialog xác nhận: những gì sẽ đổi. Dùng span vì nằm trong DialogDescription (`<p>`). */
function FillSummary({ patch, resolved }: { patch: TFillPatch | null; resolved: TResolvedAddress | null }) {
  if (!patch) return null;
  const rows = [
    patch.province !== undefined && ["Tỉnh/Thành phố", resolved?.province?.name],
    patch.ward !== undefined && ["Phường/Xã", resolved?.ward?.name ?? "(chọn lại)"],
    patch.houseNumber !== undefined && ["Số nhà, tên đường", patch.houseNumber],
  ].filter((row): row is [string, string] => Array.isArray(row) && Boolean(row[1]));

  return (
    <>
      <span className="block">Vị trí mới không khớp địa chỉ đang nhập. Cập nhật thành:</span>
      {rows.map(([label, text]) => (
        <span key={label} className="mt-1 block">
          {label}: <span className="font-medium text-foreground">{text}</span>
        </span>
      ))}
    </>
  );
}
