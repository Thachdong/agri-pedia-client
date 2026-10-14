import { cn } from "@/shared/lib/utils";

const WIDTHS = {
  md: "max-w-3xl",
  lg: "max-w-4xl",
} as const;

export type TContentLayoutProps = {
  header: React.ReactNode;
  /** Tiêu đề trang (h1) — bỏ trống khi nội dung tự có h1. */
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Nút cạnh tiêu đề (vd. "Chẩn đoán mới"). */
  actions?: React.ReactNode;
  /** Bề rộng cột nội dung: md (form, bài viết) | lg (kết quả nhiều cột). */
  width?: keyof typeof WIDTHS;
  children: React.ReactNode;
  className?: string;
};

/**
 * Khung trang nội dung 1 cột: header dính đầu, cột giữa trang (tiêu đề + actions, rồi nội dung).
 * Cả trang cuộn theo document → nội dung có thể dùng `sticky bottom-0` (vd. thanh gửi form).
 */
export function ContentLayout({
  header,
  title,
  description,
  actions,
  width = "md",
  children,
  className,
}: TContentLayoutProps) {
  return (
    <div className={cn("flex min-h-dvh flex-col bg-background", className)}>
      <div className="sticky top-0 z-40">{header}</div>
      <main className={cn("mx-auto flex w-full flex-1 flex-col gap-6 px-4 pt-6 pb-8 sm:pt-8", WIDTHS[width])}>
        {(title || actions) && (
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-1">
              {title && <h1 className="text-2xl font-bold">{title}</h1>}
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
