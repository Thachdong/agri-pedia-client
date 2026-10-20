"use client";

import { ChevronDownIcon, Loader2Icon, RefreshCwIcon, ScanSearchIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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
import { LoginRequiredDialog } from "@/shared/components/molecules";
import { ROUTES } from "@/shared/constants";
import { cn } from "@/shared/lib/utils";
import { cropIcon } from "../constants/crop-icons.constants";
import { useCrops } from "../hooks/use-crops";

export type TStartDiagnosisButtonProps = Omit<TButtonProps, "onClick" | "loading" | "children" | "asChild"> & {
  /** Mặc định "Chẩn đoán bệnh". */
  label?: string;
  /** Mobile chỉ hiện icon (header). */
  compact?: boolean;
  /** Guest: bấm → dialog mời đăng nhập / đăng ký thay vì dropdown chọn cây. Mặc định true. */
  signedIn?: boolean;
};

/**
 * Bắt đầu chẩn đoán (header, lịch sử...): bấm → dropdown chọn cây trồng được hỗ trợ (GET /knowledge/crops),
 * mỗi cây mở form /diagnosis/new?crop=<code>. Guest (`signedIn={false}`): cùng nút, bấm → dialog mời đăng nhập.
 */
export function StartDiagnosisButton({ signedIn = true, ...props }: TStartDiagnosisButtonProps) {
  return signedIn ? <CropMenuButton {...props} /> : <GuestButton {...props} />;
}

type TTriggerProps = Omit<TStartDiagnosisButtonProps, "signedIn"> & React.ComponentProps<"button">;

/** Nút chung của guest và người đã đăng nhập (giữ ref / props Radix truyền qua `asChild`). */
function TriggerButton({ label = "Chẩn đoán bệnh", compact = false, size = "sm", className, ...props }: TTriggerProps) {
  return (
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
  );
}

function GuestButton(props: Omit<TStartDiagnosisButtonProps, "signedIn">) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TriggerButton {...props} aria-haspopup="dialog" onClick={() => setOpen(true)} />
      <LoginRequiredDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

function CropMenuButton(props: Omit<TStartDiagnosisButtonProps, "signedIn">) {
  const crops = useCrops();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <TriggerButton {...props} />
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
            const Icon = cropIcon(crop.code);
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
