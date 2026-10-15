import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/atoms";
import { cn } from "@/shared/lib/utils";
import { PLANT_PART_OPTIONS } from "../constants/diagnosis.constants";
import type { TPlantPart } from "../types/diagnosis.types";

export type TPlantPartSelectProps = {
  /** "" = chưa chọn (hiện placeholder). */
  value: TPlantPart | "";
  onValueChange: (value: TPlantPart) => void;
  id?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

/** Chọn bộ phận cây của 1 ảnh (tuỳ chọn — gợi ý cho AI). */
export function PlantPartSelect({ value, onValueChange, disabled, className, ...control }: TPlantPartSelectProps) {
  return (
    <Select value={value} onValueChange={(next) => onValueChange(next as TPlantPart)} disabled={disabled}>
      <SelectTrigger className={cn("w-full", className)} {...control}>
        <SelectValue placeholder="Bộ phận (tuỳ chọn)" />
      </SelectTrigger>
      <SelectContent position="popper">
        {PLANT_PART_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
