"use client";

import { SproutIcon } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/atoms";
import { ROUTES } from "@/shared/constants";
import type { TCrop } from "../types/knowledge.types";

export type TCropPickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  crops: TCrop[];
};

/** Chọn cây trồng trước khi chẩn đoán (chỉ hiện khi hỗ trợ từ 2 cây trở lên). */
export function CropPickerDialog({ open, onOpenChange, crops }: TCropPickerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chọn cây trồng</DialogTitle>
          <DialogDescription>Chọn loại cây bạn muốn chẩn đoán bệnh.</DialogDescription>
        </DialogHeader>
        <ul className="grid grid-cols-2 gap-2">
          {crops.map((crop) => (
            <li key={crop.code}>
              <Link
                href={ROUTES.diagnosis.new(crop.code)}
                onClick={() => onOpenChange(false)}
                className="flex flex-col items-center gap-2 rounded-lg border border-border-subtle bg-surface px-3 py-4 text-sm font-medium outline-none transition-colors hover:border-highlight hover:text-highlight focus-visible:ring-2 focus-visible:ring-ring"
              >
                <SproutIcon className="size-6" aria-hidden />
                {crop.nameVi}
              </Link>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
