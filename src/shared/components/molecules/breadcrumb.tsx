import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/shared/lib/utils";

export type TBreadcrumbItem = {
  label: string;
  /** Bỏ trống ở mục cuối (trang hiện tại). */
  href?: string;
};

export type TBreadcrumbProps = Omit<React.ComponentProps<"nav">, "children"> & {
  items: TBreadcrumbItem[];
};

/** Đường dẫn phân cấp: "Bệnh cây trồng › Lúa › Bệnh đạo ôn". Mục cuối là trang hiện tại (không link). */
export function Breadcrumb({ items, className, ...props }: TBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm text-muted-foreground", className)} {...props}>
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${index}-${item.label}`} className="flex min-w-0 items-center gap-1">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="rounded-sm underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className={cn(isLast && "truncate text-foreground")}>
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRightIcon className="size-3.5 shrink-0" aria-hidden />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
