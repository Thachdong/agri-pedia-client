"use client";

import { RefreshCwIcon } from "lucide-react";
import { DiagnosisReportView } from "@/features/diagnosis";
import { Button, Dialog, DialogContent, DialogDescription, DialogTitle } from "@/shared/components/atoms";
import { Callout } from "@/shared/components/molecules";
import { useMessageDiagnosis } from "../hooks/use-message-diagnosis";

export type TChatReportDialogProps = {
  roomId: string;
  /** Tin DIAGNOSIS_REPORT đang xem; `null` = đóng. */
  messageId: string | null;
  onClose: () => void;
};

/** Report chẩn đoán được chia sẻ trong chat (chẩn đoán chung + từng ảnh) — mở từ bong bóng report. */
export function ChatReportDialog({ roomId, messageId, onClose }: TChatReportDialogProps) {
  return (
    <Dialog open={messageId !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl">
        {messageId && <ChatReport roomId={roomId} messageId={messageId} />}
      </DialogContent>
    </Dialog>
  );
}

function ChatReport({ roomId, messageId }: { roomId: string; messageId: string }) {
  const query = useMessageDiagnosis(roomId, messageId);

  if (query.isPending) {
    return (
      <div className="flex animate-pulse flex-col gap-4" aria-busy>
        <DialogTitle className="sr-only">Đang tải báo cáo chẩn đoán</DialogTitle>
        <DialogDescription className="sr-only">Đang tải</DialogDescription>
        <div className="h-8 w-2/3 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
        <div className="h-32 rounded-xl bg-muted" />
        <div className="h-56 rounded-xl bg-muted" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <>
        <DialogTitle>Không tải được báo cáo chẩn đoán</DialogTitle>
        <DialogDescription className="sr-only">Lỗi tải báo cáo chẩn đoán</DialogDescription>
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
      <DialogDescription className="sr-only">Báo cáo chẩn đoán được chia sẻ trong cuộc trò chuyện</DialogDescription>
      <DiagnosisReportView diagnosis={query.data} titleAs={DialogTitle} className="pr-6" />
    </>
  );
}
