import type { Metadata } from "next";
import { DistributorExplorerList, DistributorExplorerMap, DistributorExplorerProvider } from "@/features/distributor";
import { SiteHeader } from "@/shared/components/organisms";
import { MapListLayout } from "@/shared/components/templates";

export const metadata: Metadata = {
  title: "AgriPedia | Tìm nhà phân phối gần bạn",
  description: "Bản đồ và danh sách nhà phân phối vật tư, giống cây trồng, giống thuỷ sản gần bạn hoặc trên toàn quốc.",
};

/**
 * Public (ui-ux.md §6). Không prefetch: danh sách phụ thuộc vị trí trình duyệt của guest,
 * chỉ biết ở client (xin quyền định vị khi mount).
 */
export default function HomePage() {
  return (
    <DistributorExplorerProvider>
      <MapListLayout header={<SiteHeader />} map={<DistributorExplorerMap />} list={<DistributorExplorerList />} />
    </DistributorExplorerProvider>
  );
}
