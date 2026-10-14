import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ChatRoomsMenu } from "@/features/chat";
import { DistributorExplorerList, DistributorExplorerMap, DistributorExplorerProvider } from "@/features/distributor";
import { NotificationMenu } from "@/features/notification";
import { DistributorHomeRedirect, meQuery, type TUserProfile, UserMenu } from "@/features/user";
import { SiteHeader } from "@/shared/components/organisms";
import { MapListLayout } from "@/shared/components/templates";
import { ROUTES } from "@/shared/constants";
import { hasSession } from "@/shared/lib/auth";
import { serverHttp } from "@/shared/lib/http/server";
import { RealtimeProvider } from "@/shared/lib/realtime";
import { getPrefetchedData, HydrateQueries, prefetch } from "@/shared/lib/query/server";

export const metadata: Metadata = {
  title: "AgriPedia | Tìm nhà phân phối gần bạn",
  description: "Bản đồ và danh sách nhà phân phối vật tư, giống cây trồng, giống thuỷ sản gần bạn hoặc trên toàn quốc.",
};

/**
 * Public (ui-ux.md §6). Rẽ nhánh theo cookie phiên (guest không được gọi /users/me):
 * - Guest: không prefetch — danh sách phụ thuộc vị trí trình duyệt (xin định vị khi mount).
 * - Đã đăng nhập: prefetch /users/me. DISTRIBUTOR → profile của mình. FARMER → header đầy đủ + realtime,
 *   danh sách theo primary address (server tự lấy).
 */
export default async function HomePage() {
  if (!(await hasSession())) {
    return (
      <DistributorExplorerProvider origin="geolocation">
        <MapListLayout header={<SiteHeader />} map={<DistributorExplorerMap />} list={<DistributorExplorerList />} />
      </DistributorExplorerProvider>
    );
  }

  const me = meQuery(serverHttp);
  const state = await prefetch([me]);
  const profile = getPrefetchedData<TUserProfile>(state, me.queryKey);
  if (profile?.role === "DISTRIBUTOR") redirect(ROUTES.profile(profile.id));

  return (
    <HydrateQueries state={state}>
      <RealtimeProvider>
        <DistributorHomeRedirect />
        <DistributorExplorerProvider origin="profile">
          <MapListLayout
            header={
              <SiteHeader
                actions={
                  <>
                    <NotificationMenu />
                    <ChatRoomsMenu />
                    <UserMenu />
                  </>
                }
              />
            }
            map={<DistributorExplorerMap />}
            list={<DistributorExplorerList />}
          />
        </DistributorExplorerProvider>
      </RealtimeProvider>
    </HydrateQueries>
  );
}
