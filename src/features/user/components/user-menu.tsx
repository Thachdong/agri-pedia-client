"use client";

import { ChevronDownIcon, LogOutIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { useLogout } from "@/features/auth";
import {
  Avatar,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/atoms";
import { ROUTES } from "@/shared/constants";
import { useMe } from "../hooks/use-me";

/** Header (3) username + (4) avatar — dropdown: trang cá nhân, đăng xuất (ui-ux.md §6). */
export function UserMenu() {
  const { data: me, isPending } = useMe();
  const logout = useLogout();

  if (isPending) {
    return (
      <div className="flex items-center gap-2" aria-busy aria-label="Đang tải tài khoản">
        <div className="hidden h-4 w-20 animate-pulse rounded bg-muted sm:block" />
        <div className="size-8 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  // Lỗi tải hồ sơ (401 đã được http client đẩy về /login) → vẫn cho đăng xuất.
  const name = me?.username ?? "Tài khoản";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-2 rounded-full py-0.5 pr-1 pl-0.5 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring sm:pl-2"
        aria-label={`Tài khoản: ${name}`}
      >
        <span className="hidden max-w-32 truncate text-sm font-medium sm:inline">{name}</span>
        <Avatar src={me?.avatar} name={name} />
        <ChevronDownIcon className="size-4 text-muted-foreground" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="truncate">{name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {me && (
          <DropdownMenuItem asChild>
            <Link href={ROUTES.profile(me.id)}>
              <UserIcon aria-hidden />
              Trang cá nhân
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
