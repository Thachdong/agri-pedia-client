import { Button } from "@/shared/components/atoms";
import { cn } from "@/shared/lib/utils";

const formatMmSs = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export type TResendCodeActionProps = {
  /** Số giây còn phải chờ; 0 = ẩn countdown, cho phép gửi lại. */
  remainingSeconds: number;
  /** Đang gọi API gửi lại. */
  pending?: boolean;
  disabled?: boolean;
  onResend: () => void;
  className?: string;
};

/** "Chưa nhận được code? resend" + countdown mm:ss (wireframe /auth/activate, dùng lại cho /auth/change-password). */
export function ResendCodeAction({ remainingSeconds, pending = false, disabled, onResend, className }: TResendCodeActionProps) {
  const isCountingDown = remainingSeconds > 0;

  return (
    <div className={cn("flex flex-col items-center gap-0.5 text-sm", className)}>
      <p className="text-muted-foreground">
        Chưa nhận được code?{" "}
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto px-0 font-medium text-highlight"
          onClick={onResend}
          loading={pending}
          disabled={disabled || isCountingDown}
        >
          Gửi lại
        </Button>
      </p>
      {isCountingDown && (
        <p className="font-medium tabular-nums">
          <span className="sr-only">Có thể gửi lại sau </span>
          <time dateTime={`PT${remainingSeconds}S`}>{formatMmSs(remainingSeconds)}</time>
        </p>
      )}
    </div>
  );
}
