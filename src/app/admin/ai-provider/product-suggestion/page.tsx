import type { Metadata } from "next";
import { ProductSuggestionAiModelForm, productSuggestionAiModelQuery } from "@/features/admin-settings";
import { serverHttp } from "@/shared/lib/http/server";
import { HydrateQueries, prefetch } from "@/shared/lib/query/server";

export const metadata: Metadata = { title: "AI model tạo sản phẩm" };

/** AI model hỗ trợ tạo sản phẩm (admin-page.png mục 3). Lỗi tải → form tự hiện lỗi. */
export default async function AdminProductSuggestionAiModelPage() {
  const state = await prefetch([productSuggestionAiModelQuery(serverHttp)]);

  return (
    <HydrateQueries state={state}>
      <div className="flex flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold">AI model hỗ trợ tạo sản phẩm</h1>
          <p className="text-sm text-muted-foreground">Model AI provider đọc nhãn sản phẩm để điền sẵn form tạo sản phẩm.</p>
        </header>
        <ProductSuggestionAiModelForm />
      </div>
    </HydrateQueries>
  );
}
