import Link from "next/link";
import { cn } from "@/shared/lib/utils";
import { SidebarDrawer } from "../molecules";

export type TAdminLayoutProps = {
  /** Đích của logo (trang đầu khu quản trị). */
  homeHref: string;
  /** Menu bên trái (admin-page.png (2), (3)) — desktop cố định, mobile trong drawer. */
  sidebar: React.ReactNode;
  /** Góc phải header (admin-page.png (1)) — user menu. */
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

/**
 * Khung khu quản trị (admin-page.png): header logo + user icon, sidebar trái, nội dung (4).
 * Khung cố định 100dvh — chỉ sidebar và nội dung tự cuộn. Mobile: sidebar vào drawer (nút ☰ ở header).
 */
export function AdminLayout({ homeHref, sidebar, actions, children, className }: TAdminLayoutProps) {
  return (
    <div className={cn("flex h-dvh flex-col bg-background", className)}>
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border-subtle px-4">
        <div className="flex min-w-0 items-center gap-2">
          <SidebarDrawer title="AgriPedia Admin" description="Điều hướng khu quản trị" className="md:hidden">
            {sidebar}
          </SidebarDrawer>
          <Link
            href={homeHref}
            className="rounded-sm text-lg font-bold text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            AgriPedia
          </Link>
        </div>
        <div className="flex items-center gap-2">{actions}</div>
      </header>
      <div className="flex min-h-0 flex-1">
        <aside className="scrollbar-thin hidden w-60 shrink-0 overflow-y-auto border-r border-border-subtle bg-surface md:block">
          {sidebar}
        </aside>
        <main className="scrollbar-thin min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
