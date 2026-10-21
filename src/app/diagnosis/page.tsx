import type { Metadata } from "next";
import { articleFetchOptions, DiagnosisRelatedArticles, getTopArticles, type TTopArticlesGroup } from "@/features/article";
import { ChatRoomsMenu } from "@/features/chat";
import { cropsQuery, DiagnosisHistoryList, diagnosisHistoryQuery, StartDiagnosisButton } from "@/features/diagnosis";
import { NotificationMenu } from "@/features/notification";
import { AdminUserMenu, meQuery, type TUserProfile, UserMenu } from "@/features/user";
import { SiteHeader } from "@/shared/components/organisms";
import { ContentLayout } from "@/shared/components/templates";
import { publicServerHttp } from "@/shared/lib/http/public-server";
import { serverHttp } from "@/shared/lib/http/server";
import { getPrefetchedData, HydrateQueries, prefetch } from "@/shared/lib/query/server";
import { RealtimeProvider } from "@/shared/lib/realtime";

export const metadata: Metadata = {
  title: "Lịch sử chẩn đoán",
  description: "Các lần chẩn đoán bệnh cây trồng của bạn.",
  robots: { index: false },
};

/** Bài nổi bật (dự phòng khi chưa có bài liên quan) — lỗi không chặn trang, ẩn khối. */
const loadTopArticles = (): Promise<TTopArticlesGroup[]> =>
  getTopArticles(publicServerHttp, articleFetchOptions.top())
    .then(({ crops }) => crops)
    .catch(() => []);

/** Lịch sử chẩn đoán của tôi (cần đăng nhập) — trang đầu prefetch, cuộn để tải thêm. ADMIN: header chỉ user menu.
 * Trên lịch sử: bài viết liên quan tới bệnh đã phát hiện, chưa có thì bài nổi bật (Specs/19102026). */
export default async function DiagnosisHistoryPage() {
  const me = meQuery(serverHttp);
  const [state, topArticles] = await Promise.all([
    prefetch([me, cropsQuery(serverHttp)], { infinite: [diagnosisHistoryQuery(serverHttp)] }),
    loadTopArticles(),
  ]);
  const isAdmin = getPrefetchedData<TUserProfile>(state, me.queryKey)?.role === "ADMIN";

  return (
    <HydrateQueries state={state}>
      <RealtimeProvider>
        <ContentLayout
          header={
            <SiteHeader
              actions={
                isAdmin ? (
                  <AdminUserMenu showAdminLink />
                ) : (
                  <>
                    <StartDiagnosisButton compact />
                    <NotificationMenu />
                    <ChatRoomsMenu />
                    <UserMenu />
                  </>
                )
              }
            />
          }
          title="Lịch sử chẩn đoán"
          actions={<StartDiagnosisButton label="Chẩn đoán mới" variant="outline" />}
        >
          {/* Trên lịch sử: danh sách tự tải thêm khi cuộn tới cuối nên khối bên dưới sẽ bị đẩy mãi. */}
          <DiagnosisRelatedArticles topArticles={topArticles} />
          <DiagnosisHistoryList />
        </ContentLayout>
      </RealtimeProvider>
    </HydrateQueries>
  );
}
