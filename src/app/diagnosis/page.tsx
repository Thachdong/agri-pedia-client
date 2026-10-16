import type { Metadata } from "next";
import { ChatRoomsMenu } from "@/features/chat";
import { cropsQuery, DiagnosisHistoryList, diagnosisHistoryQuery, StartDiagnosisButton } from "@/features/diagnosis";
import { NotificationMenu } from "@/features/notification";
import { meQuery, UserMenu } from "@/features/user";
import { SiteHeader } from "@/shared/components/organisms";
import { ContentLayout } from "@/shared/components/templates";
import { serverHttp } from "@/shared/lib/http/server";
import { HydrateQueries, prefetch } from "@/shared/lib/query/server";
import { RealtimeProvider } from "@/shared/lib/realtime";

export const metadata: Metadata = {
  title: "Lịch sử chẩn đoán | AgriPedia",
  description: "Các lần chẩn đoán bệnh cây trồng của bạn.",
  robots: { index: false },
};

/** Lịch sử chẩn đoán của tôi (cần đăng nhập) — trang đầu prefetch, cuộn để tải thêm. */
export default async function DiagnosisHistoryPage() {
  const state = await prefetch([meQuery(serverHttp), cropsQuery(serverHttp)], {
    infinite: [diagnosisHistoryQuery(serverHttp)],
  });

  return (
    <HydrateQueries state={state}>
      <RealtimeProvider>
        <ContentLayout
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
          title="Lịch sử chẩn đoán"
          actions={<StartDiagnosisButton label="Chẩn đoán mới" variant="outline" />}
        >
          <DiagnosisHistoryList />
        </ContentLayout>
      </RealtimeProvider>
    </HydrateQueries>
  );
}
