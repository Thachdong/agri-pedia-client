import { cn } from "@/shared/lib/utils";

export type TProfileLayoutProps = {
  header: React.ReactNode;
  /** Phần thông tin (tiêu đề + nút + bảng thông tin). */
  info: React.ReactNode;
  /** Tabs nội dung bên dưới (Sản phẩm | Đánh giá) — chưa có thì bỏ trống. */
  tabs?: React.ReactNode;
  className?: string;
};

/**
 * Khung trang profile (ui-ux.md §7, image-5 / image-6): header, cột nội dung giữa trang
 * gồm phần thông tin rồi tới tabs. Cả trang cuộn theo document, header dính đầu.
 */
export function ProfileLayout({ header, info, tabs, className }: TProfileLayoutProps) {
  return (
    <div className={cn("flex min-h-dvh flex-col bg-background", className)}>
      {/* Trang cuộn theo document → header dính đầu để notification / chat / user menu luôn bấm được. */}
      <div className="sticky top-0 z-40">{header}</div>
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-6 sm:py-8">
        {info}
        {tabs}
      </main>
    </div>
  );
}
