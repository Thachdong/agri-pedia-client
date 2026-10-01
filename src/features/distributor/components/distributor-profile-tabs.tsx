import { PackageIcon, StarIcon } from "lucide-react";
import { ShopReviewsPanel } from "@/features/review";
import type { TUserProfile } from "@/features/user";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/atoms";
import { cn } from "@/shared/lib/utils";
import { DistributorProductsTab } from "./distributor-products-tab";

export type TDistributorProfileTabsProps = {
  distributorId: string;
  /** Người đang xem (đã đăng nhập); guest → undefined. */
  viewer?: Pick<TUserProfile, "id" | "role">;
  className?: string;
};

/**
 * Tabs dưới phần thông tin profile (ui-ux.md §7, image-5 / image-6): Sản phẩm | Đánh giá, mặc định Sản phẩm.
 * Tab chưa mở chưa mount → chưa gọi API của tab đó (trừ khi page đã prefetch).
 */
export function DistributorProfileTabs({ distributorId, viewer, className }: TDistributorProfileTabsProps) {
  return (
    <Tabs defaultValue="products" className={cn("gap-6", className)}>
      <TabsList aria-label="Nội dung của shop" className="grid h-11! w-full grid-cols-2">
        <TabsTrigger value="products" className="h-full gap-2 text-base">
          <PackageIcon aria-hidden />
          Sản phẩm
        </TabsTrigger>
        <TabsTrigger value="reviews" className="h-full gap-2 text-base">
          <StarIcon aria-hidden />
          Đánh giá
        </TabsTrigger>
      </TabsList>

      <TabsContent value="products">
        <DistributorProductsTab distributorId={distributorId} viewer={viewer} />
      </TabsContent>
      <TabsContent value="reviews">
        <ShopReviewsPanel distributorId={distributorId} currentUserId={viewer?.id} />
      </TabsContent>
    </Tabs>
  );
}
