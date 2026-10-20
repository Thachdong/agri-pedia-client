import type { Metadata } from "next";
import { articleFetchOptions, getTopArticles, TopArticlesSection, type TTopArticlesGroup } from "@/features/article";
import { ChatRoomsMenu } from "@/features/chat";
import { cropsQuery, diagnosisSettingsQuery, HomeDiagnosisPanel } from "@/features/diagnosis";
import {
  DistributorExplorerList,
  DistributorExplorerMap,
  DistributorExplorerProvider,
  type TDistributorExplorerProviderProps,
} from "@/features/distributor";
import { NotificationMenu } from "@/features/notification";
import { AdminUserMenu, meQuery, type TUserProfile, UserMenu } from "@/features/user";
import { SiteHeader } from "@/shared/components/organisms";
import { HomeLayout } from "@/shared/components/templates";
import { hasSession } from "@/shared/lib/auth";
import { publicServerHttp } from "@/shared/lib/http/public-server";
import { serverHttp } from "@/shared/lib/http/server";
import { RealtimeProvider } from "@/shared/lib/realtime";
import { getPrefetchedData, HydrateQueries, prefetch } from "@/shared/lib/query/server";

export const metadata: Metadata = {
  title: { absolute: "AgriPedia | Chẩn đoán bệnh cây trồng & nhà phân phối gần bạn" },
  description:
    "Chẩn đoán bệnh cây trồng bằng ảnh, đọc bài viết bệnh nổi bật và tìm nhà phân phối vật tư, giống cây trồng gần bạn.",
};

/** Top articles lỗi không chặn trang chủ — ẩn khối. */
const loadTopArticles = (): Promise<TTopArticlesGroup[]> =>
  getTopArticles(publicServerHttp, articleFetchOptions.top())
    .then(({ crops }) => crops)
    .catch(() => []);

/**
 * Public (Specs/19102026): form chẩn đoán → bài viết nổi bật → map + distributor (map chỉ init khi cuộn tới).
 * Rẽ nhánh theo cookie phiên (guest không được gọi /users/me):
 * - Guest: form hiện với cây mặc định, thao tác → mời đăng nhập; hỏi vị trí khi tới khối map.
 * - FARMER: header đầy đủ + realtime; danh sách theo primary address.
 * - DISTRIBUTOR: như FARMER, shop của mình ghim đầu danh sách, shop khác không mở được.
 * - ADMIN: chỉ user menu (kèm link trang quản trị); map hiện toàn bộ distributor, không hỏi vị trí.
 * Không đọc được /users/me trên server (access token hết hạn — chỉ BFF refresh được) → hiển thị như FARMER.
 */
export default async function HomePage() {
  const signedIn = await hasSession();
  const me = meQuery(serverHttp);
  const [state, topArticles] = await Promise.all([
    prefetch([cropsQuery(serverHttp), diagnosisSettingsQuery(serverHttp), ...(signedIn ? [me] : [])]),
    loadTopArticles(),
  ]);

  if (!signedIn) {
    return (
      <HydrateQueries state={state}>
        <HomeContent
          header={<SiteHeader />}
          explorer={{ origin: "geolocation" }}
          guest
          topArticles={topArticles}
        />
      </HydrateQueries>
    );
  }

  const profile = getPrefetchedData<TUserProfile>(state, me.queryKey);

  if (profile?.role === "ADMIN") {
    return (
      <HydrateQueries state={state}>
        <HomeContent
          header={<SiteHeader actions={<AdminUserMenu showAdminLink />} />}
          explorer={{ origin: "all" }}
          topArticles={topArticles}
        />
      </HydrateQueries>
    );
  }

  return (
    <HydrateQueries state={state}>
      <RealtimeProvider>
        <HomeContent
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
          explorer={{
            origin: "profile",
            ownShopId: profile?.role === "DISTRIBUTOR" ? profile.id : undefined,
          }}
          topArticles={topArticles}
        />
      </RealtimeProvider>
    </HydrateQueries>
  );
}

type THomeContentProps = {
  header: React.ReactNode;
  explorer: Omit<TDistributorExplorerProviderProps, "children">;
  guest?: boolean;
  topArticles: TTopArticlesGroup[];
};

function HomeContent({ header, explorer, guest = false, topArticles }: THomeContentProps) {
  return (
    <DistributorExplorerProvider {...explorer}>
      <HomeLayout
        header={header}
        mapTitle="Nhà phân phối"
        map={<DistributorExplorerMap />}
        list={<DistributorExplorerList />}
      >
        <HomeDiagnosisPanel guest={guest} />
        <TopArticlesSection groups={topArticles} />
      </HomeLayout>
    </DistributorExplorerProvider>
  );
}
