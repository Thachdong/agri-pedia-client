import Link from "next/link";
import { ROUTES } from "@/shared/constants";
import { cn } from "@/shared/lib/utils";
import { Button } from "../atoms";

export type TSiteHeaderProps = {
  /** Vùng bên phải (ui-ux.md §6 (1)–(4) khi đã đăng nhập). Bỏ trống → nút Login / Register cho guest. */
  actions?: React.ReactNode;
  className?: string;
};

/** Header trang chính (ui-ux.md §6): logo AgriPedia + actions. */
export function SiteHeader({ actions, className }: TSiteHeaderProps) {
  return (
    <header className={cn("border-b border-border-subtle bg-background", className)}>
      <div className="flex h-14 w-full items-center justify-between gap-4 px-4">
        <Link
          href={ROUTES.home}
          className="rounded-sm text-lg font-bold text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          AgriPedia
        </Link>
        <nav aria-label="Tài khoản" className="flex items-center gap-2">
          {actions ?? <GuestActions />}
        </nav>
      </div>
    </header>
  );
}

function GuestActions() {
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
