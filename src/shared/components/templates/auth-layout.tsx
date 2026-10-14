import { cn } from "@/shared/lib/utils";

export type TAuthLayoutProps = {
  /** Thanh trên cùng (logo + link về trang chủ). */
  header: React.ReactNode;
  title: React.ReactNode;
  /** Nội dung card — tự cuộn phần dài bên trong (card có chiều cao tối đa = viewport). */
  children: React.ReactNode;
  /** Dưới cùng card (links điều hướng). */
  footer?: React.ReactNode;
  className?: string;
};

/**
 * Khung trang auth (ui-ux.md: register/activate/login/reset-password):
 * header cố định, card căn giữa; card không vượt viewport để nội dung dài cuộn bên trong.
 */
export function AuthLayout({ header, title, children, footer, className }: TAuthLayoutProps) {
  return (
    <div className={cn("flex h-dvh flex-col bg-background", className)}>
      {header}
      <main className="flex min-h-0 flex-1 items-center justify-center px-4 py-6">
        <section
          aria-labelledby="auth-layout-title"
          className="card-normal flex max-h-full w-full max-w-md flex-col gap-4 rounded-xl p-5 shadow-sm sm:p-6"
        >
          <h1 id="auth-layout-title" className="text-center text-2xl font-semibold">
            {title}
          </h1>
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
          {footer}
        </section>
      </main>
    </div>
  );
}
