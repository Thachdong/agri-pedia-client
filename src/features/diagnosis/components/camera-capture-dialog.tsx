"use client";

import { CameraIcon, CameraOffIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Button, Dialog, DialogContent, DialogDescription, DialogTitle } from "@/shared/components/atoms";
import { useCameraStream, type TCameraStatus } from "@/shared/hooks";
import { cn } from "@/shared/lib/utils";

const FALLBACK_MESSAGES: Partial<Record<TCameraStatus, string>> = {
  unsupported: "Trình duyệt không hỗ trợ mở camera trong trang.",
  denied: "Bạn đã từ chối quyền dùng camera.",
  error: "Không mở được camera.",
};

export type TCameraCaptureDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Số ảnh còn được chụp — hết thì tự đóng. */
  remaining: number;
  onCapture: (file: File) => void;
};

/**
 * Chụp ảnh bằng camera sau trong trang: khung ngắm cố định giữa màn hình (không vẽ lên ảnh) + hướng dẫn.
 * Chụp được nhiều ảnh liên tiếp tới khi hết chỗ. Không mở được camera → dùng camera của máy qua input file `capture`.
 * Mobile: toàn màn hình.
 */
export function CameraCaptureDialog({ open, onOpenChange, remaining, onCapture }: TCameraCaptureDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "top-0 left-0 flex h-dvh max-w-full translate-x-0 translate-y-0 flex-col gap-3 rounded-none p-0 sm:max-w-full",
          "sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-h-[90dvh] sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl",
        )}
      >
        <div className="px-4 pt-4 pr-12">
          <DialogTitle>Chụp ảnh vết bệnh</DialogTitle>
          <DialogDescription>Di chuyển vết bệnh vào giữa khung hình</DialogDescription>
        </div>
        {/* Chỉ mount khi mở → camera bật khi mở, tắt khi đóng. */}
        {open && (
          <CameraView
            remaining={remaining}
            onCapture={(file) => {
              onCapture(file);
              if (remaining <= 1) onOpenChange(false);
            }}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

type TCameraViewProps = { remaining: number; onCapture: (file: File) => void; onDone: () => void };

function CameraView({ remaining, onCapture, onDone }: TCameraViewProps) {
  const { videoRef, status, capture } = useCameraStream();
  const [taken, setTaken] = useState(0);
  const [capturing, setCapturing] = useState(false);
  const fallbackRef = useRef<HTMLInputElement>(null);
  const fallbackMessage = FALLBACK_MESSAGES[status];

  const handleCapture = async () => {
    setCapturing(true);
    const file = await capture();
    setCapturing(false);
    if (!file) return;
    setTaken((count) => count + 1);
    onCapture(file);
  };

  const handleFallback = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) onCapture(file);
    onDone();
  };

  if (fallbackMessage) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 pb-6 text-center">
        <CameraOffIcon className="size-10 text-muted-foreground" aria-hidden />
        <p className="text-sm text-muted-foreground">{fallbackMessage} Bạn vẫn có thể chụp bằng ứng dụng camera của máy.</p>
        <input
          ref={fallbackRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFallback}
          tabIndex={-1}
          aria-hidden
          className="sr-only"
        />
        <Button onClick={() => fallbackRef.current?.click()}>
          <CameraIcon aria-hidden />
          Mở camera của máy
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 pb-4">
      <div className="relative min-h-0 flex-1 overflow-hidden bg-foreground sm:aspect-[3/4] sm:flex-none">
        <video ref={videoRef} autoPlay playsInline muted className="size-full object-cover" aria-label="Khung ngắm camera" />
        {/* Khung ngắm: vùng giữa sáng, xung quanh tối. Chỉ hướng dẫn, không vẽ lên ảnh. */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 aspect-square w-3/5 max-w-72 -translate-x-1/2 -translate-y-1/2 rounded-xl border-2 border-background shadow-[0_0_0_9999px] shadow-foreground/45"
        />
        {status === "starting" && (
          <p className="absolute inset-x-0 bottom-4 text-center text-sm text-background">Đang mở camera…</p>
        )}
      </div>
      <div className="grid grid-cols-3 items-center px-4">
        <span className="text-xs text-muted-foreground" aria-live="polite">
          {taken > 0 ? `Đã chụp ${taken} ảnh` : `Còn ${remaining} ảnh`}
        </span>
        <button
          type="button"
          onClick={handleCapture}
          disabled={status !== "streaming" || capturing}
          aria-label="Chụp"
          className="mx-auto flex size-16 items-center justify-center rounded-full border-4 border-primary bg-background outline-none transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          <span className="size-11 rounded-full bg-primary" />
        </button>
        <Button variant="ghost" onClick={onDone} className="justify-self-end">
          Xong
        </Button>
      </div>
    </div>
  );
}
