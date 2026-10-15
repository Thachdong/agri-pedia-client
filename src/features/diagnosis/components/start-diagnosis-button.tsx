"use client";

import {
  ChevronDownIcon,
  Loader2Icon,
  RefreshCwIcon,
  ScanSearchIcon,
  SproutIcon,
  TreeDeciduousIcon,
  WheatIcon,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  type TButtonProps,
} from "@/shared/components/atoms";
import { ROUTES } from "@/shared/constants";
import { cn } from "@/shared/lib/utils";
import { useCrops } from "../hooks/use-crops";

/** Icon theo cây — cây mới chưa có icon riêng dùng mầm cây. */
const CROP_ICONS: Record<string, LucideIcon> = {
  RICE: WheatIcon,
  DURIAN: TreeDeciduousIcon,
};

export type TStartDiagnosisButtonProps = Omit<TButtonProps, "onClick" | "loading" | "children" | "asChild"> & {
  /** Mặc định "Chẩn đoán bệnh". */
  label?: string;
  /** Mobile chỉ hiện icon (header). */
  compact?: boolean;
};

/**
 * Bắt đầu chẩn đoán (header, lịch sử...): bấm → dropdown chọn cây trồng được hỗ trợ (GET /knowledge/crops),
 * mỗi cây mở form /diagnosis/new?crop=<code>.
 */
export function StartDiagnosisButton({
  label = "Chẩn đoán bệnh",
  compact = false,
  size = "sm",
  className,
  ...props
}: TStartDiagnosisButtonProps) {
  const crops = useCrops();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size={size}
          aria-label={compact ? label : undefined}
          className={cn(compact && "px-2 sm:px-3", className)}
          {...props}
        >
          <ScanSearchIcon aria-hidden />
          <span className={cn(compact && "hidden sm:inline")}>{label}</span>
          <ChevronDownIcon aria-hidden className={cn("opacity-70", compact && "hidden sm:block")} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Chọn cây trồng</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {crops.isPending ? (
          <DropdownMenuItem disabled>
            <Loader2Icon aria-hidden className="animate-spin" />
            Đang tải…
          </DropdownMenuItem>
        ) : crops.isError ? (
          <DropdownMenuItem
            onSelect={(event) => {
              // Giữ menu mở để thấy danh sách sau khi tải lại.
              event.preventDefault();
              void crops.refetch();
            }}
          >
            <RefreshCwIcon aria-hidden />
            Không tải được — thử lại
          </DropdownMenuItem>
        ) : crops.data.length === 0 ? (
          <DropdownMenuItem disabled>Chưa có cây trồng được hỗ trợ</DropdownMenuItem>
        ) : (
          crops.data.map((crop) => {
            const Icon = CROP_ICONS[crop.code] ?? SproutIcon;
            return (
              <DropdownMenuItem key={crop.code} asChild>
                <Link href={ROUTES.diagnosis.new(crop.code)}>
                  <Icon aria-hidden />
                  {crop.nameVi}
                </Link>
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
