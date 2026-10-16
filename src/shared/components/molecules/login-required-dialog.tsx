"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/shared/constants";
import { LOGIN_NEXT_PARAM } from "@/shared/lib/auth/auth.constants";
import { cn } from "@/shared/lib/utils";
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../atoms";

export type TLoginRequiredDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Mặc định "Bạn cần phải đăng nhập để thực hiện tính năng này". */
  description?: string;
  className?: string;
};

/** Guest bấm vào tính năng cần đăng nhập → mời Đăng nhập (quay lại trang hiện tại sau khi đăng nhập) hoặc Đăng ký. */
export function LoginRequiredDialog({
  open,
  onOpenChange,
  description = "Bạn cần phải đăng nhập để thực hiện tính năng này",
  className,
}: TLoginRequiredDialogProps) {
  const pathname = usePathname();
  const loginHref = `${ROUTES.auth.login}?${LOGIN_NEXT_PARAM}=${encodeURIComponent(pathname)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-sm", className)}>
        <DialogHeader>
          <DialogTitle>Cần đăng nhập</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button asChild variant="outline">
            <Link href={ROUTES.auth.register}>Đăng ký</Link>
          </Button>
          <Button asChild variant="highlight">
            <Link href={loginHref}>Đăng nhập</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
