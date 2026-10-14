"use client";

import { ScanSearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/shared/components/atoms";
import { ROUTES } from "@/shared/constants";
import { toast } from "@/shared/lib/toast";
import { useCrops } from "../hooks/use-crops";
import type { TCrop } from "../types/knowledge.types";
import { CropPickerDialog } from "./crop-picker-dialog";

/**
 * Nút "Chẩn đoán bệnh" trên header (đã đăng nhập): 1 cây được hỗ trợ → vào thẳng form; nhiều cây → dialog chọn cây.
 * Mobile chỉ hiện icon.
 */
export function DiagnosisHeaderButton() {
  const router = useRouter();
  const crops = useCrops();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const start = (list: TCrop[]) => {
    if (list.length === 0) toast.info("Chưa có cây trồng nào được hỗ trợ chẩn đoán");
    else if (list.length === 1) router.push(ROUTES.diagnosis.new(list[0].code));
    else setPickerOpen(true);
  };

  const handleClick = async () => {
    if (crops.data) return start(crops.data);
    setLoading(true);
    const result = await crops.refetch();
    setLoading(false);
    if (result.data) start(result.data);
    else toast.error("Không tải được danh sách cây trồng, vui lòng thử lại");
  };

  return (
    <>
      <Button
        size="sm"
        onClick={handleClick}
        loading={loading}
        aria-label="Chẩn đoán bệnh"
        className="px-2 sm:px-3"
      >
        {!loading && <ScanSearchIcon aria-hidden />}
        <span className="hidden sm:inline">Chẩn đoán bệnh</span>
      </Button>
      {crops.data && <CropPickerDialog open={pickerOpen} onOpenChange={setPickerOpen} crops={crops.data} />}
    </>
  );
}
