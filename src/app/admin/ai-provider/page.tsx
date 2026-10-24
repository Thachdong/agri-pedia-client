import { redirect } from "next/navigation";
import { ROUTES } from "@/shared/constants";

/** /admin/ai-provider → AI model chẩn đoán (mục đầu của nhóm "AI Provider"). */
export default function AdminAiProviderPage() {
  redirect(ROUTES.admin.aiProvider.diagnosis);
}
