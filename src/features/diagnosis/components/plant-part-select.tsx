import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/atoms";
import { cn } from "@/shared/lib/utils";
import type { TPlantPart } from "../types/diagnosis.types";
import type { TCropPlantPart } from "../types/knowledge.types";

export type TPlantPartSelectProps = {
  /** "" = chưa chọn (hiện placeholder). */
  value: TPlantPart | "";
  onValueChange: (value: TPlantPart) => void;
  /** Bộ phận của cây đang chẩn đoán (GET /knowledge/crops `plantParts`, đúng thứ tự dropdown). */
  options: TCropPlantPart[];
  id?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

/** Chọn bộ phận cây của 1 ảnh (tuỳ chọn — gợi ý cho AI). */
export function PlantPartSelect({ value, onValueChange, options, disabled, className, ...control }: TPlantPartSelectProps) {
  return (
    <Select value={value} onValueChange={(next) => onValueChange(next as TPlantPart)} disabled={disabled}>
      <SelectTrigger className={cn("w-full", className)} {...control}>
        <SelectValue placeholder="Bộ phận (tuỳ chọn)" />
      </SelectTrigger>
      <SelectContent position="popper">
        {options.map((option) => (
          <SelectItem key={option.code} value={option.code}>
            {option.nameVi}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
