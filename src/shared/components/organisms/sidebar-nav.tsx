"use client";

import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../atoms";

export type TSidebarNavItem = {
  label: string;
  href: string;
  /** Chưa dùng được (vd. tính năng mock) — hiện mờ, không bấm được. */
  disabled?: boolean;
};

export type TSidebarNavGroup = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  items: TSidebarNavItem[];
  /** Mở sẵn khi chưa có item nào active trong nhóm. Mặc định: true. */
  defaultOpen?: boolean;
};

export type TSidebarNavProps = {
  groups: TSidebarNavGroup[];
  /** Gọi sau khi chọn 1 item — vd. đóng drawer trên mobile. */
  onNavigate?: () => void;
  className?: string;
};

/** Item active = trùng pathname (bỏ query) — "/admin/articles" không active khi đang ở "/admin/articles/new". */
const isActive = (pathname: string, href: string) => pathname === href.split("?")[0];

/**
 * Menu bên trái của khu quản trị (admin-page.png (2), (3)): mỗi nhóm bấm để thu gọn / mở rộng menu con.
 * Nhóm chứa trang hiện tại luôn mở khi vào trang.
 */
export function SidebarNav({ groups, onNavigate, className }: TSidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Quản trị" className={cn("flex flex-col gap-1 p-2", className)}>
      {groups.map((group) => {
        const hasActive = group.items.some((item) => isActive(pathname, item.href));
        return (
          <Collapsible key={group.id} defaultOpen={hasActive || (group.defaultOpen ?? true)}>
            <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring [&>svg]:size-4">
              {group.icon}
              <span className="flex-1 truncate">{group.label}</span>
              <ChevronRightIcon
                className="text-muted-foreground transition-transform group-data-[state=open]:rotate-90"
                aria-hidden
              />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="mt-1 flex flex-col gap-0.5 ml-5 border-l border-border-subtle pl-2">
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  const itemClass = "block rounded-md px-3 py-1.5 text-sm";
                  return (
                    <li key={item.href}>
                      {item.disabled ? (
                        <span aria-disabled className={cn(itemClass, "cursor-not-allowed text-muted-foreground")}>
                          {item.label}
                        </span>
                      ) : (
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          onClick={onNavigate}
                          className={cn(
                            itemClass,
                            "outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            active ? "bg-highlight-subtle font-medium text-highlight" : "text-foreground hover:bg-muted",
                          )}
                        >
                          {item.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </nav>
  );
}
