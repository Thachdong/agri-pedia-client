"use client";

import { PencilIcon } from "lucide-react";
import { useState } from "react";
import { Avatar, Button } from "@/shared/components/atoms";
import { InfoTable, type TInfoTableItem } from "@/shared/components/molecules";
import { cn } from "@/shared/lib/utils";
import { FARMER_PROFILE_INFO_LABELS } from "../constants/profile.constants";
import { useMe } from "../hooks/use-me";
import { EditProfileDialog } from "./edit-profile-dialog";
import { PrimaryAddressPicker } from "./primary-address-picker";

export type TFarmerProfileInfoProps = { className?: string };

/**
 * Phần thông tin trang /profile/me (FARMER) — bố cục như thông tin distributor (ui-ux.md §7) nhưng không có tabs:
 * avatar + username + "Chỉnh sửa" (M6 + M7), bảng Email / Phone, Giới thiệu, Địa chỉ (radio → đặt mặc định ngay).
 */
export function FarmerProfileInfo({ className }: TFarmerProfileInfoProps) {
  const me = useMe();
  const [editing, setEditing] = useState(false);

  if (me.isPending) return <FarmerProfileInfoSkeleton className={className} />;
  if (me.isError) {
    return (
      <section className={cn("flex flex-col items-center gap-3 rounded-lg border border-border-subtle p-6 text-center", className)}>
        <p role="alert" className="text-sm text-muted-foreground">
          Không tải được hồ sơ của bạn.
        </p>
        <Button variant="outline" size="sm" onClick={() => me.refetch()}>
          Thử lại
        </Button>
      </section>
    );
  }

  const { id, username, avatar, email, phone, bio } = me.data;
  const items: TInfoTableItem[] = [
    { label: FARMER_PROFILE_INFO_LABELS.contact, value: email ?? phone },
    { label: FARMER_PROFILE_INFO_LABELS.bio, value: bio },
    { label: FARMER_PROFILE_INFO_LABELS.address, value: <PrimaryAddressPicker userId={id} /> },
  ];

  return (
    <section aria-labelledby="farmer-profile-title" className={cn("flex flex-col gap-4", className)}>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar src={avatar} name={username} size="lg" />
          <h1 id="farmer-profile-title" className="truncate text-xl font-semibold">
            {username}
          </h1>
        </div>
        <Button variant="outline" onClick={() => setEditing(true)}>
          <PencilIcon aria-hidden />
          Chỉnh sửa
        </Button>
      </header>
      <InfoTable items={items} aria-label={`Thông tin ${username}`} />
      <EditProfileDialog open={editing} onOpenChange={setEditing} />
    </section>
  );
}

function FarmerProfileInfoSkeleton({ className }: { className?: string }) {
  return (
    <section className={cn("flex flex-col gap-4", className)} aria-busy aria-label="Đang tải hồ sơ">
      <div className="flex items-center gap-3">
        <div className="size-10 animate-pulse rounded-full bg-muted" />
        <div className="h-6 w-48 animate-pulse rounded bg-muted" />
      </div>
      <div className="divide-y divide-border-subtle rounded-lg border border-border-subtle">
        {Object.values(FARMER_PROFILE_INFO_LABELS).map((label) => (
          <div key={label} className="grid grid-cols-1 gap-2 px-4 py-3 sm:grid-cols-[minmax(10rem,1fr)_2fr]">
            <div className="h-4 w-28 animate-pulse rounded bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </section>
  );
}
