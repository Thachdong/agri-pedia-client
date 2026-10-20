import type { Metadata } from "next";
import { adminDiagnosisSettingsQuery, DiagnosisSettingsForm } from "@/features/admin-settings";
import { cropsQuery } from "@/features/diagnosis";
import { serverHttp } from "@/shared/lib/http/server";
import { HydrateQueries, prefetch } from "@/shared/lib/query/server";

export const metadata: Metadata = { title: "Cài đặt chẩn đoán" };

/** Cài đặt chẩn đoán (Specs/19102026/admin.md): lượt miễn phí / ngày + thông số form. Lỗi tải → form tự hiện lỗi. */
export default async function AdminDiagnosisSettingsPage() {
  const state = await prefetch([adminDiagnosisSettingsQuery(serverHttp), cropsQuery(serverHttp)]);

  return (
    <HydrateQueries state={state}>
      <div className="flex flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold">Cài đặt chẩn đoán</h1>
          <p className="text-sm text-muted-foreground">Áp dụng cho mọi người dùng ngay sau khi lưu.</p>
        </header>
        <DiagnosisSettingsForm />
      </div>
    </HydrateQueries>
  );
}
