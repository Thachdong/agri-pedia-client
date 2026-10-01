"use client";

import { AddressFields, type TAddressFieldsErrors, type TAddressFieldsValue } from "@/features/location";
import { Button } from "@/shared/components/atoms";
import { applyServerErrors, FORM_ROOT_ERROR, useAppForm } from "@/shared/lib/form";
import { isAppError } from "@/shared/lib/http";
import { toast } from "@/shared/lib/toast";
import { cn } from "@/shared/lib/utils";
import { ADDRESS_ERROR_CODE, ADDRESS_ERROR_MESSAGES } from "../constants/address.constants";
import { useCreateMyAddress } from "../hooks/use-create-my-address";
import { createAddressSchema } from "../schemas/create-address.schema";
import type { TCreateAddressFormValues } from "../types/user.types";

export type TAddAddressFormProps = {
  /** Id người đang đăng nhập. */
  userId: string;
  /** Thêm thành công → bên dùng đóng form. */
  onDone: () => void;
  onCancel: () => void;
  className?: string;
};

const DEFAULT_VALUES: TCreateAddressFormValues = { province: "", ward: "", houseNumber: "" };
const LOCATION_FIELDS = ["lat", "long"] as const;

/** Lỗi server gắn được vào field cụ thể; còn lại hiện dưới form. */
const FIELD_ERRORS: Partial<Record<string, keyof TCreateAddressFormValues>> = {
  [ADDRESS_ERROR_CODE.LOCATION_INVALID]: "province",
  [ADDRESS_ERROR_CODE.INVALID_COORDINATES]: "lat",
};

/**
 * Form thêm address (M7): tỉnh → xã → số nhà → vị trí trên map. POST ngay khi bấm "Thêm",
 * address mới luôn là thường (`isPrimary: false`) — đổi mặc định bằng radio.
 * Là `<form>` riêng: không đặt lồng trong form khác.
 */
export function AddAddressForm({ userId, onDone, onCancel, className }: TAddAddressFormProps) {
  const createAddress = useCreateMyAddress(userId);
  const form = useAppForm<TCreateAddressFormValues>({ schema: createAddressSchema, defaultValues: DEFAULT_VALUES });
  const { errors, isSubmitted } = form.formState;
  const address = form.watch() as TAddressFieldsValue;
  const isSubmitting = createAddress.isPending;

  const changeAddress = (patch: Partial<TAddressFieldsValue>) => {
    for (const [key, value] of Object.entries(patch) as [keyof TAddressFieldsValue, string | number][]) {
      form.setValue(key, value, { shouldDirty: true, shouldValidate: isSubmitted });
    }
    if ("lat" in patch) void form.trigger(LOCATION_FIELDS);
  };

  const addressErrors: TAddressFieldsErrors = {
    province: errors.province?.message,
    ward: errors.ward?.message,
    houseNumber: errors.houseNumber?.message,
    location: errors.lat?.message ?? errors.long?.message,
  };

  const onSubmit = form.handleSubmit((values) => {
    // Schema đã bắt có lat/long.
    const { province, ward, houseNumber, lat = 0, long = 0 } = values;
    createAddress.mutate(
      { province, ward, houseNumber, lat, long, isPrimary: false },
      {
        onSuccess: () => {
          toast.success("Đã thêm địa chỉ");
          onDone();
        },
        onError: (error) => {
          const message = isAppError(error) ? ADDRESS_ERROR_MESSAGES[error.code] : undefined;
          const field = isAppError(error) ? FIELD_ERRORS[error.code] : undefined;
          if (message && field) {
            form.setError(field, { type: "server", message });
            return;
          }
          if (message) {
            form.setError(FORM_ROOT_ERROR, { type: "server", message });
            return;
          }
          applyServerErrors(form, error);
        },
      },
    );
  });

  const rootError = errors.root?.server?.message;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-label="Thêm địa chỉ"
      className={cn("flex flex-col gap-4 rounded-lg border border-border-subtle p-3 sm:p-4", className)}
    >
      <AddressFields
        idPrefix="new-address"
        value={address}
        onChange={changeAddress}
        onBlur={(field) => void form.trigger(field === "location" ? LOCATION_FIELDS : field)}
        errors={addressErrors}
        disabled={isSubmitting}
      />
      {rootError && (
        <p role="alert" className="text-sm text-destructive">
          {rootError}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Huỷ
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Đang thêm…" : "Thêm địa chỉ"}
        </Button>
      </div>
    </form>
  );
}
