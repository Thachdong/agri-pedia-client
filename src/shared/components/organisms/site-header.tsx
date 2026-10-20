import { BookOpenIcon } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/shared/constants";
import { cn } from "@/shared/lib/utils";
import { Button } from "../atoms";

export type TSiteHeaderProps = {
  /** Vùng bên phải (ui-ux.md §6 (1)–(4) khi đã đăng nhập). Bỏ trống → nút Login / Register cho guest. */
  actions?: React.ReactNode;
  /** Hiện trước actions / nút guest — tính năng chính luôn thấy (vd. "Chẩn đoán bệnh" cho guest). */
  primaryAction?: React.ReactNode;
  className?: string;
};

/** Header trang chính (ui-ux.md §6): logo AgriPedia + actions. */
export function SiteHeader({ actions, primaryAction, className }: TSiteHeaderProps) {
  return (
    <header className={cn("border-b border-border-subtle bg-background", className)}>
      <div className="flex h-14 w-full items-center justify-between gap-4 px-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <Link
            href={ROUTES.home}
            className="rounded-sm text-lg font-bold text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            AgriPedia
          </Link>
          <nav aria-label="Chính">
            <Link
              href={ROUTES.articles.index}
              aria-label="Bệnh cây trồng"
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            >
              <BookOpenIcon className="size-4" aria-hidden />
              <span className="hidden md:inline">Bệnh cây trồng</span>
            </Link>
          </nav>
        </div>
        <nav aria-label="Tài khoản" className="flex items-center gap-2">
          {primaryAction}
          {actions ?? <GuestActions />}
        </nav>
      </div>
    </header>
  );
}

/** Nút Login / Register của guest — export để trang tự quyết khi nào hiện (vd. phiên đọc ở client). */
export function GuestActions() {
  return (
    <>
      <Button asChild variant="ghost">
        <Link href={ROUTES.auth.login}>Login</Link>
      </Button>
      <Button asChild>
        <Link href={ROUTES.auth.register}>Register</Link>
      </Button>
    </>
  );
}
