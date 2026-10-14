"use client";

import { cn } from "@/shared/lib/utils";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../atoms";

const DIGITS_ONLY = "^\\d+$";

export type TOtpCodeInputProps = {
  /** Số ô — mỗi ô một chữ số. */
  length: number;
  value: string;
  onChange: (value: string) => void;
  /** Gọi khi nhập đủ `length` chữ số (gõ hoặc dán) — thường để focus nút submit. */
  onComplete?: (value: string) => void;
  onBlur?: () => void;
  ref?: React.Ref<HTMLInputElement>;
  id?: string;
  name?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  "aria-label"?: string;
  className?: string;
};

/**
 * Nhập mã OTP: chỉ nhận số, tự nhảy ô, dán cả mã, gợi ý mã từ SMS (autocomplete one-time-code).
 * Thực chất là một input ẩn → `ref` / `id` trỏ vào input đó (focus, label, form đều dùng được).
 */
export function OtpCodeInput({
  length,
  value,
  onChange,
  onComplete,
  className,
  "aria-invalid": ariaInvalid,
  ...props
}: TOtpCodeInputProps) {
  return (
    <InputOTP
      maxLength={length}
      pattern={DIGITS_ONLY}
      inputMode="numeric"
      autoComplete="one-time-code"
      value={value}
      onChange={onChange}
      onComplete={onComplete}
      aria-invalid={ariaInvalid}
      containerClassName={cn("w-full", className)}
      {...props}
    >
      <InputOTPGroup className="w-full">
        {Array.from({ length }, (_, index) => (
          <InputOTPSlot
            key={index}
            index={index}
            aria-invalid={ariaInvalid}
            className="h-11 flex-1 bg-background text-lg font-medium"
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}
