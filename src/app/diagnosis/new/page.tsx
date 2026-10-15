import type { Metadata } from "next";
import { ChatRoomsMenu } from "@/features/chat";
import { CropNotSupportedRedirect, cropsQuery, DiagnosisForm, StartDiagnosisButton, type TCropsResponse } from "@/features/diagnosis";
import { NotificationMenu } from "@/features/notification";
import { meQuery, UserMenu } from "@/features/user";
import { SiteHeader } from "@/shared/components/organisms";
import { ContentLayout } from "@/shared/components/templates";
import { serverHttp } from "@/shared/lib/http/server";
import { getPrefetchedData, HydrateQueries, prefetch } from "@/shared/lib/query/server";
import { RealtimeProvider } from "@/shared/lib/realtime";

export const metadata: Metadata = {
  title: "Chẩn đoán bệnh | AgriPedia",
  description: "Chụp hoặc chọn ảnh cây trồng để AI nhận diện bệnh, sâu hại.",
  robots: { index: false },
};

/**
 * Form chẩn đoán (cần đăng nhập — PROTECTED_PATHS). `crop` phải có trong GET /knowledge/crops;
 * thiếu / không hỗ trợ (hoặc không tải được danh mục) → toast + về trang chủ.
 */
export default async function NewDiagnosisPage({ searchParams }: PageProps<"/diagnosis/new">) {
  const { crop } = await searchParams;
  const crops = cropsQuery(serverHttp);
  const state = await prefetch([meQuery(serverHttp), crops]);
  const cropName =
    typeof crop === "string"
      ? getPrefetchedData<TCropsResponse>(state, crops.queryKey)?.crops.find((item) => item.code === crop)?.nameVi
      : undefined;

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
          title={cropName ? `Chẩn đoán bệnh — ${cropName}` : "Chẩn đoán bệnh"}
          description="Chụp hoặc chọn 1–5 ảnh; có thể chọn bộ phận cây cho từng ảnh."
        >
          {cropName ? <DiagnosisForm cropType={crop as string} /> : <CropNotSupportedRedirect />}
        </ContentLayout>
      </RealtimeProvider>
    </HydrateQueries>
  );
}
