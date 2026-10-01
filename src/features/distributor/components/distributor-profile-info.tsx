"use client";

import { ExternalLinkIcon } from "lucide-react";
import { AddressList, type TAddressListItem } from "@/features/location";
import { useMyAddresses } from "@/features/user";
import { Avatar, Button } from "@/shared/components/atoms";
import { InfoTable, type TInfoTableItem } from "@/shared/components/molecules";
import { BUSINESS_TYPE_LABELS } from "@/shared/constants";
import { cn } from "@/shared/lib/utils";
import { PROFILE_INFO_LABELS } from "../constants/distributor.constants";
import { useDistributorProfile } from "../hooks/use-distributor-profile";

export type TDistributorProfileInfoProps = {
  distributorId: string;
  /** Người xem là chủ profile → địa chỉ lấy đủ danh sách (/users/me/addresses). */
  isOwner?: boolean;
  /** Nút cạnh tiêu đề (Chat / Đánh giá / Chỉnh sửa) — do trang quyết định theo người xem. */
  actions?: React.ReactNode;
  className?: string;
};

/**
 * Phần thông tin distributor (ui-ux.md §7, image-5): tiêu đề username + nút, bảng Email/Phone, Giấy phép,
 * Địa chỉ, Lĩnh vực, Giới thiệu. Avatar: signed URL, không có / lỗi → chữ cái đầu.
 */
export function DistributorProfileInfo({ distributorId, isOwner = false, actions, className }: TDistributorProfileInfoProps) {
  const profile = useDistributorProfile(distributorId);
  const myAddresses = useMyAddresses({ enabled: isOwner });

  if (profile.isPending) return <ProfileInfoSkeleton className={className} />;
  if (profile.isError) {
    return (
      <section className={cn("flex flex-col items-center gap-3 rounded-lg border border-border-subtle p-6 text-center", className)}>
        <p role="alert" className="text-sm text-muted-foreground">
          Không tải được thông tin distributor.
        </p>
        <Button variant="outline" size="sm" onClick={() => profile.refetch()}>
          Thử lại
        </Button>
      </section>
    );
  }

  const { username, avatar, email, phone, bussinessLicense, bussinessType, bio, address } = profile.data;
  // Owner: danh sách đầy đủ; đang tải / lỗi → tạm dùng primary address của profile.
  const addresses: TAddressListItem[] =
    isOwner && myAddresses.data ? myAddresses.data : address ? [{ ...address, isPrimary: true }] : [];

  const items: TInfoTableItem[] = [
    { label: PROFILE_INFO_LABELS.contact, value: email ?? phone },
    {
      label: PROFILE_INFO_LABELS.license,
      value: bussinessLicense && (
        <a
          href={bussinessLicense}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-highlight underline-offset-4 hover:underline"
        >
          Xem giấy phép
          <ExternalLinkIcon className="size-3.5" aria-hidden />
        </a>
      ),
    },
    { label: PROFILE_INFO_LABELS.address, value: <AddressList addresses={addresses} /> },
    { label: PROFILE_INFO_LABELS.businessType, value: bussinessType && BUSINESS_TYPE_LABELS[bussinessType] },
    { label: PROFILE_INFO_LABELS.bio, value: bio },
  ];

  return (
    <section aria-labelledby="distributor-profile-title" className={cn("flex flex-col gap-4", className)}>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar src={avatar} name={username} size="lg" />
          <h1 id="distributor-profile-title" className="truncate text-xl font-semibold">
            {username}
          </h1>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </header>
      <InfoTable items={items} aria-label={`Thông tin ${username}`} />
    </section>
  );
}

function ProfileInfoSkeleton({ className }: { className?: string }) {
  return (
    <section className={cn("flex flex-col gap-4", className)} aria-busy aria-label="Đang tải thông tin distributor">
      <div className="flex items-center gap-3">
        <div className="size-10 animate-pulse rounded-full bg-muted" />
        <div className="h-6 w-48 animate-pulse rounded bg-muted" />
      </div>
      <div className="divide-y divide-border-subtle rounded-lg border border-border-subtle">
        {Object.values(PROFILE_INFO_LABELS).map((label) => (
          <div key={label} className="grid grid-cols-1 gap-2 px-4 py-3 sm:grid-cols-[minmax(10rem,1fr)_2fr]">
            <div className="h-4 w-28 animate-pulse rounded bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </section>
  );
}
