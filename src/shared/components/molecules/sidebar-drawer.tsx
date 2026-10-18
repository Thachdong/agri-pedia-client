"use client";

import { MenuIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button, Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../atoms";

export type TSidebarDrawerProps = {
  /** Tiêu đề drawer (đọc bởi screen reader, hiện ở đầu drawer). */
  title: string;
  children: React.ReactNode;
  className?: string;
};

/** Nút ☰ mở menu bên trái dạng drawer (mobile). Tự đóng khi đổi trang. */
export function SidebarDrawer({ title, children, className }: TSidebarDrawerProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Đổi trang → đóng drawer (state gắn với pathname đang mở, không cần effect).
  const [openedAt, setOpenedAt] = useState(pathname);
  if (open && openedAt !== pathname) setOpen(false);

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setOpenedAt(pathname);
      }}
    >
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Mở menu" className={className}>
          <MenuIcon aria-hidden />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 gap-0 p-0">
        <SheetHeader className="border-b border-border-subtle">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription className="sr-only">Điều hướng khu quản trị</SheetDescription>
        </SheetHeader>
        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
