import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ChatRoomsMenu } from "@/features/chat";
import { NotificationMenu } from "@/features/notification";
import { FarmerProfileInfo, meQuery, myAddressesQuery, type TUserProfile, UserMenu } from "@/features/user";
import { SiteHeader } from "@/shared/components/organisms";
import { ProfileLayout } from "@/shared/components/templates";
import { ROUTES } from "@/shared/constants";
import { serverHttp } from "@/shared/lib/http/server";
import { getPrefetchedData, HydrateQueries, prefetch } from "@/shared/lib/query/server";
import { RealtimeProvider } from "@/shared/lib/realtime";

export const metadata: Metadata = {
  title: "Hồ sơ của tôi | AgriPedia",
  description: "Xem và cập nhật thông tin cá nhân, địa chỉ mặc định trên AgriPedia.",
  robots: { index: false },
};

/**
 * Hồ sơ của chính mình (FARMER) — cần đăng nhập (PROTECTED_PATHS). Chỉ phần thông tin, không có tabs.
 * DISTRIBUTOR → profile public /profile/<id> (có tabs Sản phẩm | Đánh giá).
 * me + addresses prefetch cùng vòng; lỗi thì organism tự tải lại / hiện lỗi trên client.
 */
export default async function MyProfilePage() {
  const me = meQuery(serverHttp);
  const state = await prefetch([me, myAddressesQuery(serverHttp)]);

  const viewer = getPrefetchedData<TUserProfile>(state, me.queryKey);
  if (viewer?.role === "DISTRIBUTOR") redirect(ROUTES.profile(viewer.id));

  return (
    <HydrateQueries state={state}>
      <RealtimeProvider>
        <ProfileLayout
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
          info={<FarmerProfileInfo />}
        />
      </RealtimeProvider>
    </HydrateQueries>
  );
}
