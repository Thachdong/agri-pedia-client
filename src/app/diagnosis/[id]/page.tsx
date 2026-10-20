import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChatRoomsMenu } from "@/features/chat";
import { cropsQuery, diagnosisQuery, DiagnosisResult, StartDiagnosisButton } from "@/features/diagnosis";
import { NotificationMenu } from "@/features/notification";
import { meQuery, UserMenu } from "@/features/user";
import { SiteHeader } from "@/shared/components/organisms";
import { ContentLayout } from "@/shared/components/templates";
import { isAppError } from "@/shared/lib/http";
import { serverHttp } from "@/shared/lib/http/server";
import { HydrateQueries, prefetch } from "@/shared/lib/query/server";
import { RealtimeProvider } from "@/shared/lib/realtime";

export const metadata: Metadata = {
  title: "Kết quả chẩn đoán",
  description: "Kết quả chẩn đoán bệnh cây trồng từ ảnh.",
  robots: { index: false },
};

/**
 * Kết quả 1 lần chẩn đoán của tôi (cần đăng nhập). Chi tiết là query bắt buộc: 404 (của người khác / id lạ)
 * hoặc 400 (id sai dạng) → notFound(). Đang PROCESSING → client chờ realtime `diagnosis.completed` + poll.
 */
export default async function DiagnosisDetailPage({ params }: PageProps<"/diagnosis/[id]">) {
  const { id } = await params;

  let state;
  try {
    state = await prefetch([meQuery(serverHttp), cropsQuery(serverHttp)], {
      required: [diagnosisQuery(id, serverHttp)],
    });
  } catch (error) {
    if (isAppError(error) && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }

  return (
    <HydrateQueries state={state}>
      <RealtimeProvider>
        <ContentLayout
          width="lg"
          header={
            <SiteHeader
              actions={
                <>
                  <StartDiagnosisButton compact />
                  <NotificationMenu />
                  <ChatRoomsMenu />
                  <UserMenu />
                </>
              }
            />
          }
        >
          <DiagnosisResult id={id} />
        </ContentLayout>
      </RealtimeProvider>
    </HydrateQueries>
  );
}
