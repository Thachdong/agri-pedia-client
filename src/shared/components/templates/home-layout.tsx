import { cn } from "@/shared/lib/utils";

export type THomeLayoutProps = {
  header: React.ReactNode;
  /** Các khối phía trên khối bản đồ, xếp dọc theo thứ tự (vd. form chẩn đoán, bài viết nổi bật). */
  children: React.ReactNode;
  /** Tiêu đề khối bản đồ + danh sách. */
  mapTitle: React.ReactNode;
  /** Bản đồ — lấp đầy vùng của nó. */
  map: React.ReactNode;
  /** Danh sách cạnh bản đồ — tự cuộn bên trong cột. */
  list: React.ReactNode;
  className?: string;
};

/**
 * Trang chủ (Specs/19102026): header + các khối cuộn dọc, cuối trang là khối bản đồ + danh sách cao cố định.
 * Desktop: map trái chiếm phần lớn / list phải hẹp (20rem), cao ~70vh; mobile: map trên 60vh, list dưới tự cuộn.
 */
export function HomeLayout({ header, children, mapTitle, map, list, className }: THomeLayoutProps) {
  return (
    <div className={cn("flex min-h-dvh flex-col bg-background", className)}>
      {header}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-6 sm:py-8">
        {children}
        <section aria-labelledby="home-map-title" className="flex flex-col gap-3">
          <h2 id="home-map-title" className="text-lg font-semibold sm:text-xl">
            {mapTitle}
          </h2>
          <div className="card-normal flex flex-col overflow-hidden rounded-xl md:h-[70vh] md:flex-row">
            <div className="relative isolate h-[60vh] shrink-0 md:h-auto md:flex-1">{map}</div>
            <div className="scrollbar-thin max-h-[60vh] min-h-0 overflow-y-auto border-t border-border-subtle p-4 md:max-h-none md:w-80 md:shrink-0 md:border-t-0 md:border-l">
              {list}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
