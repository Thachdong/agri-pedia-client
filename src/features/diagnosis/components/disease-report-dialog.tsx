"use client";

import { RefreshCwIcon } from "lucide-react";
import { Button, Dialog, DialogContent, DialogDescription, DialogTitle } from "@/shared/components/atoms";
import { Callout } from "@/shared/components/molecules";
import { useDisease } from "../hooks/use-disease";
import { DiseaseArticle } from "./disease-detail";

export type TDiseaseReportDialogProps = {
  /** diseaseCode đang xem; `null` = đóng. */
  code: string | null;
  onClose: () => void;
};

/** Báo cáo đầy đủ 1 bệnh (GET /knowledge/diseases/:code) trong dialog — mở từ tên bệnh ở trang kết quả. */
export function DiseaseReportDialog({ code, onClose }: TDiseaseReportDialogProps) {
  return (
    <Dialog open={code !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl">
        {code && <DiseaseReport code={code} />}
      </DialogContent>
    </Dialog>
  );
}

function DiseaseReport({ code }: { code: string }) {
  const query = useDisease(code);

  if (query.isPending) {
    return (
      <div className="flex animate-pulse flex-col gap-4" aria-busy>
        <DialogTitle className="sr-only">Đang tải thông tin bệnh</DialogTitle>
        <DialogDescription className="sr-only">Đang tải</DialogDescription>
        <div className="h-8 w-2/3 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
        <div className="h-48 rounded-lg bg-muted" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <>
        <DialogTitle>Không tải được thông tin bệnh</DialogTitle>
        <DialogDescription className="sr-only">Lỗi tải thông tin bệnh</DialogDescription>
        <Callout
          tone="danger"
          role="alert"
          action={
            <Button size="sm" variant="outline" onClick={() => void query.refetch()}>
              <RefreshCwIcon aria-hidden />
              Thử lại
            </Button>
          }
        >
          {query.error.message}
        </Callout>
      </>
    );
  }

  return (
    <>
      <DialogDescription className="sr-only">Thông tin chi tiết về bệnh {query.data.nameVi}</DialogDescription>
      <DiseaseArticle disease={query.data} titleAs={DialogTitle} className="pr-6" />
    </>
  );
}
