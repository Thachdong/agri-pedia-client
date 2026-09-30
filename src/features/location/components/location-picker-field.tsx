"use client";

import { LocateFixedIcon, MapPinIcon } from "lucide-react";
import { useState } from "react";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/atoms";
import { FormField } from "@/shared/components/molecules";
import { MapPicker } from "@/shared/components/organisms";
import { useGeolocation, type TCoordinates } from "@/shared/hooks";
import { cn } from "@/shared/lib/utils";

export type TLocationPickerFieldProps = {
  id: string;
  label?: string;
  value: TCoordinates | null;
  onChange: (coords: TCoordinates) => void;
  /** Lỗi validate từ form (vd: chưa chọn vị trí). */
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

const formatCoords = ({ lat, long }: TCoordinates) => `${lat.toFixed(6)}, ${long.toFixed(6)}`;

/**
 * Chọn toạ độ: mở dialog chọn trên bản đồ, hoặc lấy nhanh vị trí hiện tại.
 * Từ chối quyền vị trí vẫn chọn được trên bản đồ.
 */
export function LocationPickerField({
  id,
  label = "Vị trí trên bản đồ",
  value,
  onChange,
  error,
  required,
  disabled,
  className,
}: TLocationPickerFieldProps) {
  const geolocation = useGeolocation();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<TCoordinates | null>(value);
  const [focus, setFocus] = useState<TCoordinates | null>(null);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setDraft(value);
      setFocus(null);
    }
    setOpen(next);
  };

  const applyCurrentLocation = async () => {
    const coords = await geolocation.request();
    if (coords) onChange(coords);
  };

  const pickCurrentLocationOnMap = async () => {
    const coords = await geolocation.request();
    if (!coords) return;
    setDraft(coords);
    setFocus(coords);
  };

  const confirm = () => {
    if (draft) onChange(draft);
    setOpen(false);
  };

  return (
    <FormField id={id} label={label} error={error} required={required} className={className}>
      {(control) => (
        <div className="flex flex-col gap-2">
          <p
            className={cn(
              "flex items-center gap-2 rounded-lg border border-input px-2.5 py-1.5 text-sm",
              !value && "text-muted-foreground",
            )}
            aria-live="polite"
          >
            <MapPinIcon className="size-4 shrink-0" aria-hidden />
            {value ? formatCoords(value) : "Chưa chọn vị trí"}
          </p>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Dialog open={open} onOpenChange={handleOpenChange}>
              <Button type="button" variant="outline" disabled={disabled} onClick={() => handleOpenChange(true)} {...control}>
                <MapPinIcon aria-hidden />
                Chọn trên bản đồ
              </Button>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Chọn vị trí trên bản đồ</DialogTitle>
                  <DialogDescription>Nhấn lên bản đồ để đặt vị trí, kéo ghim để chỉnh lại.</DialogDescription>
                </DialogHeader>

                <MapPicker value={draft} onChange={setDraft} focus={focus} aria-label="Bản đồ chọn vị trí" />

                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className={cn(!draft && "text-muted-foreground")}>
                    {draft ? formatCoords(draft) : "Chưa chọn vị trí"}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    loading={geolocation.isLoading}
                    onClick={pickCurrentLocationOnMap}
                  >
                    {!geolocation.isLoading && <LocateFixedIcon aria-hidden />}
                    Vị trí hiện tại
                  </Button>
                </div>
                {geolocation.error && <p className="text-xs text-destructive">{geolocation.error}</p>}

                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Huỷ
                    </Button>
                  </DialogClose>
                  <Button type="button" disabled={!draft} onClick={confirm}>
                    Xác nhận
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              type="button"
              variant="ghost"
              disabled={disabled}
              loading={geolocation.isLoading && !open}
              onClick={applyCurrentLocation}
            >
              {!(geolocation.isLoading && !open) && <LocateFixedIcon aria-hidden />}
              Dùng vị trí hiện tại
            </Button>
          </div>

          {geolocation.error && !open && <p className="text-xs text-destructive">{geolocation.error}</p>}
        </div>
      )}
    </FormField>
  );
}
