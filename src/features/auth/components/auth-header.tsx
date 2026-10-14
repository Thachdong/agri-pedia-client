import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/shared/constants";
import { cn } from "@/shared/lib/utils";

export type TAuthHeaderProps = { className?: string };

const LINK_FOCUS = "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Header trang auth (ui-ux.md mục (1)): logo AgriPedia + "Back To Home". */
export function AuthHeader({ className }: TAuthHeaderProps) {
  return (
    <header className={cn("border-b border-border-subtle bg-background", className)}>
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <Link href={ROUTES.home} className={cn("text-lg font-bold text-primary", LINK_FOCUS)}>
          AgriPedia
        </Link>
        <Link
          href={ROUTES.home}
          className={cn("inline-flex items-center gap-1 text-sm text-foreground hover:text-highlight", LINK_FOCUS)}
        >
          <ArrowLeftIcon className="size-4" aria-hidden />
          Back To Home
        </Link>
      </div>
    </header>
  );
}
