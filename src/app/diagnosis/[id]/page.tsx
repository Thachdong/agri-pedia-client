import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChatRoomsMenu } from "@/features/chat";
import { cropsQuery, diagnosisQuery, DiagnosisResult, StartDiagnosisButton } from "@/features/diagnosis";
import { SendReportButton } from "@/features/diagnosis-share";
import { NotificationMenu } from "@/features/notification";
import { AdminUserMenu, meQuery, type TUserProfile, UserMenu } from "@/features/user";
import { SiteHeader } from "@/shared/components/organisms";
import { ContentLayout } from "@/shared/components/templates";
import { isAppError } from "@/shared/lib/http";
import { serverHttp } from "@/shared/lib/http/server";
import { getPrefetchedData, HydrateQueries, prefetch } from "@/shared/lib/query/server";
import { RealtimeProvider } from "@/shared/lib/realtime";

export const metadata: Metadata = {
  title: "Kết quả chẩn đoán",
  description: "Kết quả chẩn đoán bệnh cây trồng từ ảnh.",
  robots: { index: false },
};

/**
 * Kết quả 1 lần chẩn đoán của tôi (cần đăng nhập). Chi tiết là query bắt buộc: 404 (của người khác / id lạ)
 * hoặc 400 (id sai dạng) → notFound(). Đang PROCESSING → client chờ realtime `diagnosis.completed` + poll.
 * FARMER + COMPLETED → nút "Gửi báo cáo" cạnh tiêu đề (gửi report cho distributor qua chat). ADMIN: header chỉ user menu.
 */
export default async function DiagnosisDetailPage({ params }: PageProps<"/diagnosis/[id]">) {
  const { id } = await params;

  const me = meQuery(serverHttp);
  let state;
  try {
    state = await prefetch([me, cropsQuery(serverHttp)], {
      required: [diagnosisQuery(id, serverHttp)],
    });
  } catch (error) {
    if (isAppError(error) && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }

  const isAdmin = getPrefetchedData<TUserProfile>(state, me.queryKey)?.role === "ADMIN";

  return (
    <HydrateQueries state={state}>
      <RealtimeProvider>
        <ContentLayout
          width="lg"
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
        >
          <DiagnosisResult id={id} actions={<SendReportButton diagnosisId={id} />} />
        </ContentLayout>
      </RealtimeProvider>
    </HydrateQueries>
  );
}
