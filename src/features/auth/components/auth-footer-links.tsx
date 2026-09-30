import Link from "next/link";
import { ROUTES } from "@/shared/constants";
import { cn } from "@/shared/lib/utils";

const AUTH_FOOTER_LINKS = {
  register: { question: "Bạn chưa có account?", label: "Đăng ký", href: ROUTES.auth.register },
  login: { question: "Đã có account?", label: "Đăng nhập", href: ROUTES.auth.login },
  activate: { question: "Account chưa kích hoạt?", label: "Kích hoạt", href: ROUTES.auth.activate },
  resetPassword: { question: "Quên mật khẩu?", label: "Reset mật khẩu", href: ROUTES.auth.resetPassword },
} as const;

export type TAuthFooterLinkKey = keyof typeof AUTH_FOOTER_LINKS;

export type TAuthFooterLinksProps = {
  /** Link hiển thị, theo thứ tự — mỗi trang auth tự chọn (ui-ux.md mục (4)). */
  links: readonly TAuthFooterLinkKey[];
  className?: string;
};

export function AuthFooterLinks({ links, className }: TAuthFooterLinksProps) {
  return (
    <ul className={cn("flex flex-col items-center gap-1 text-sm text-muted-foreground", className)}>
      {links.map((key) => {
        const { question, label, href } = AUTH_FOOTER_LINKS[key];
        return (
          <li key={key}>
            {question}{" "}
            <Link
              href={href}
              className="rounded-sm font-medium text-highlight underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
