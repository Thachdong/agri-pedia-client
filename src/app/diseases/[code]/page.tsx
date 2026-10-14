import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ChatRoomsMenu } from "@/features/chat";
import { diseaseQuery, DiseaseDetail, StartDiagnosisButton, type TDisease } from "@/features/diagnosis";
import { NotificationMenu } from "@/features/notification";
import { meQuery, UserMenu } from "@/features/user";
import { SiteHeader } from "@/shared/components/organisms";
import { ContentLayout } from "@/shared/components/templates";
import { hasSession } from "@/shared/lib/auth";
import { isAppError } from "@/shared/lib/http";
import { serverHttp } from "@/shared/lib/http/server";
import { getPrefetchedData, HydrateQueries, prefetch } from "@/shared/lib/query/server";
import { RealtimeProvider } from "@/shared/lib/realtime";

/**
 * Dữ liệu trang — `cache` để generateMetadata và page dùng chung 1 lần gọi NestJS mỗi request.
 * Bài viết là query bắt buộc: 404 KNOWLEDGE_DISEASE_NOT_FOUND hoặc 400 (mã sai dạng) → notFound(). Guest không gọi /users/me.
 */
const loadDiseasePage = cache(async (code: string) => {
  const signedIn = await hasSession();
  const query = diseaseQuery(code, serverHttp);

  let state;
  try {
    state = await prefetch(signedIn ? [meQuery(serverHttp)] : [], { required: [query] });
  } catch (error) {
    if (isAppError(error) && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }

  const disease = getPrefetchedData<TDisease>(state, query.queryKey);
  if (!disease) notFound();
  return { state, disease, signedIn };
});

export async function generateMetadata({ params }: PageProps<"/diseases/[code]">): Promise<Metadata> {
  const { code } = await params;
  const { disease } = await loadDiseasePage(code);
  return {
    title: `${disease.nameVi} | AgriPedia`,
    description: disease.symptoms[0]?.slice(0, 160) || `Thông tin bệnh ${disease.nameVi} trên cây trồng.`,
  };
}

/** Bài viết bệnh (public) — mở từ "Bài viết liên quan" của kết quả chẩn đoán hoặc link "Bệnh dễ nhầm". */
export default async function DiseasePage({ params }: PageProps<"/diseases/[code]">) {
  const { code } = await params;
  const { state, signedIn } = await loadDiseasePage(code);

  if (!signedIn) {
    return (
      <HydrateQueries state={state}>
        <ContentLayout header={<SiteHeader />}>
          <DiseaseDetail code={code} />
        </ContentLayout>
      </HydrateQueries>
    );
  }

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
        >
          <DiseaseDetail code={code} />
        </ContentLayout>
      </RealtimeProvider>
    </HydrateQueries>
  );
}
