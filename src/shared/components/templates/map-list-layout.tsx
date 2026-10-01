import { cn } from "@/shared/lib/utils";

export type TMapListLayoutProps = {
  header: React.ReactNode;
  /** Bản đồ — lấp đầy vùng của nó. */
  map: React.ReactNode;
  /** Tìm kiếm / bộ lọc phía trên danh sách (ui-ux.md §6 (6)). */
  filters?: React.ReactNode;
  /** Danh sách — tự cuộn bên trong cột. */
  list: React.ReactNode;
  className?: string;
};

/**
 * Khung trang map + danh sách (ui-ux.md §6, image-4): header cố định, map bên trái, cột filter + list bên phải.
 * Mobile: map trên (40vh), list dưới cuộn trong phần còn lại.
 */
export function MapListLayout({ header, map, filters, list, className }: TMapListLayoutProps) {
  return (
    <div className={cn("flex h-dvh flex-col bg-background", className)}>
      {header}
      <main className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="relative isolate h-[40vh] shrink-0 md:h-auto md:flex-1">{map}</div>
        <aside className="flex min-h-0 flex-1 flex-col border-t border-border-subtle md:w-96 md:flex-none md:border-t-0 md:border-l">
          {filters && <div className="border-b border-border-subtle p-4">{filters}</div>}
          <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto p-4">{list}</div>
        </aside>
      </main>
    </div>
  );
}
