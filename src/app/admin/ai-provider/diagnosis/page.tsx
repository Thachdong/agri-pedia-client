import type { Metadata } from "next";
import { adminDiagnosisAiModelsQuery, DiagnosisAiModelsForm } from "@/features/admin-settings";
import { serverHttp } from "@/shared/lib/http/server";
import { HydrateQueries, prefetch } from "@/shared/lib/query/server";

export const metadata: Metadata = { title: "AI model chẩn đoán" };

/** AI model các bước chẩn đoán bệnh (admin-page.png mục 3). Lỗi tải → form tự hiện lỗi. */
export default async function AdminDiagnosisAiModelsPage() {
  const state = await prefetch([adminDiagnosisAiModelsQuery(serverHttp)]);

  return (
    <HydrateQueries state={state}>
      <div className="flex flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold">AI model chẩn đoán bệnh</h1>
          <p className="text-sm text-muted-foreground">Model AI provider dùng ở từng bước chẩn đoán ảnh cây trồng.</p>
        </header>
        <DiagnosisAiModelsForm />
      </div>
    </HydrateQueries>
  );
}
