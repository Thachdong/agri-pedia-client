"use client";

import { LayoutDashboardIcon, LogOutIcon, MailIcon, PhoneIcon, UserRoundIcon } from "lucide-react";
import Link from "next/link";
import { useLogout } from "@/features/auth";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/atoms";
import { ROUTES } from "@/shared/constants";
import { useMe } from "../hooks/use-me";

export type TAdminUserMenuProps = {
  /** Thêm mục "Trang quản trị" — dùng ở trang public (trang chủ), khu quản trị không cần. */
  showAdminLink?: boolean;
};

/**
 * User icon của ADMIN (admin-page.png (1)) — dropdown: email / số điện thoại đăng nhập, (tuỳ chọn) link trang quản
 * trị, đăng xuất.
 */
export function AdminUserMenu({ showAdminLink = false }: TAdminUserMenuProps) {
  const { data: me, isPending } = useMe();
  const logout = useLogout();

  const identifier = me?.email ?? me?.phone;
  const IdentifierIcon = me?.loginType === "PHONE" ? PhoneIcon : MailIcon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Tài khoản quản trị" className="rounded-full">
          <UserRoundIcon aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex items-center gap-2 font-normal">
          <IdentifierIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          {isPending ? (
            <span className="h-4 w-32 animate-pulse rounded bg-muted" aria-label="Đang tải tài khoản" />
          ) : (
            <span className="truncate">{identifier ?? "Tài khoản"}</span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {showAdminLink && (
          <DropdownMenuItem asChild>
            <Link href={ROUTES.admin.root}>
              <LayoutDashboardIcon aria-hidden />
              Trang quản trị
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem disabled={logout.isPending} onSelect={() => logout.mutate()}>
          <LogOutIcon aria-hidden />
          {logout.isPending ? "Đang đăng xuất…" : "Đăng xuất"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
