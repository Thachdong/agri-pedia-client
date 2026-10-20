"use client";

import { SendIcon } from "lucide-react";
import { useState } from "react";
import { useDiagnosis } from "@/features/diagnosis";
import { useMe } from "@/features/user";
import { Button, type TButtonProps } from "@/shared/components/atoms";
import { SendReportDialog } from "./send-report-dialog";

export type TSendReportButtonProps = Omit<TButtonProps, "onClick" | "children"> & {
  diagnosisId: string;
};

/**
 * Nút "Gửi báo cáo" ở trang kết quả — chỉ FARMER (DISTRIBUTOR / ADMIN không thấy) và chỉ khi chẩn đoán COMPLETED.
 * Dùng chung cache với trang kết quả → hiện ngay khi kết quả về (realtime / poll). Cần RealtimeProvider.
 */
export function SendReportButton({ diagnosisId, ...props }: TSendReportButtonProps) {
  const { data: me } = useMe();
  const { data: diagnosis } = useDiagnosis(diagnosisId);
  const [open, setOpen] = useState(false);

  if (me?.role !== "FARMER" || diagnosis?.status !== "COMPLETED") return null;

  return (
    <>
      <Button variant="highlight" onClick={() => setOpen(true)} {...props}>
        <SendIcon aria-hidden />
        Gửi báo cáo
      </Button>
      <SendReportDialog open={open} onOpenChange={setOpen} diagnosis={diagnosis} currentUserId={me.id} />
    </>
  );
}
