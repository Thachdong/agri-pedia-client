import { cva } from "class-variance-authority";
import { MapPinIcon, NavigationIcon } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/shared/components/atoms";
import { BUSINESS_TYPE_LABELS, ROUTES } from "@/shared/constants";
import { cn } from "@/shared/lib/utils";
import { formatDistance } from "@/shared/utils";
import type { TNearbyDistributor } from "../types/distributor.types";

// border-2 cho cả 2 trạng thái → chọn/bỏ chọn không làm card nhảy layout.
const cardVariants = cva(
  "flex items-center gap-3 rounded-lg border-2 p-3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
  {
    variants: {
      selected: {
        true: "card-highlight",
        false: "card-normal hover:border-highlight/50",
      },
    },
    defaultVariants: { selected: false },
  },
);

export type TDistributorCardProps = Omit<React.ComponentProps<typeof Link>, "href" | "children"> & {
  distributor: TNearbyDistributor;
  /** Tên tỉnh/thành — API trả codename, bên gọi tra tên qua danh sách provinces. */
  provinceName?: string;
  /** Đang được chọn (vd: click marker trên map). */
  selected?: boolean;
};

/** Card distributor (ui-ux.md §6 (7)) — click mở /profile/<userId>. */
export function DistributorCard({ distributor, provinceName, selected = false, className, ...props }: TDistributorCardProps) {
  const { userId, username, bussinessType, address, distanceMeters } = distributor;

  return (
    <Link
      href={ROUTES.profile(userId)}
      aria-current={selected || undefined}
      className={cn(cardVariants({ selected }), className)}
      {...props}
    >
      {/* `avatar` của API là media id, chưa có endpoint đổi sang URL → hiện chữ cái đầu. */}
      <Avatar name={username} size="lg" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate font-medium">{username}</span>
        {bussinessType && (
          <span className="truncate text-xs text-muted-foreground">{BUSINESS_TYPE_LABELS[bussinessType]}</span>
        )}
        <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span className="inline-flex min-w-0 items-center gap-1">
            <MapPinIcon className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{provinceName ?? address.province}</span>
          </span>
          {distanceMeters !== null && (
            <span className="inline-flex items-center gap-1 text-highlight">
              <NavigationIcon className="size-3.5 shrink-0" aria-hidden />
              {formatDistance(distanceMeters)}
            </span>
          )}
        </span>
      </div>
    </Link>
  );
}
