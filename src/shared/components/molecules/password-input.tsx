"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/utils";
import { Button, Input } from "../atoms";

export type TPasswordInputProps = Omit<React.ComponentProps<"input">, "type">;

/** Input mật khẩu có nút ẩn/hiện. `ref` được chuyển thẳng vào input (dùng được với `form.register`). */
export function PasswordInput({ className, disabled, ...props }: TPasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOffIcon : EyeIcon;

  return (
    <div className="relative">
      <Input type={visible ? "text" : "password"} disabled={disabled} className={cn("pr-9", className)} {...props} />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute top-1/2 right-0.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        onClick={() => setVisible((current) => !current)}
        disabled={disabled}
        aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        aria-pressed={visible}
      >
        <Icon aria-hidden />
      </Button>
    </div>
  );
}
