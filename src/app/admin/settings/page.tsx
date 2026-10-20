import { redirect } from "next/navigation";
import { ROUTES } from "@/shared/constants";

/** /admin/settings → cài đặt chẩn đoán (mục đầu của nhóm "Cài đặt"). */
export default function AdminSettingsPage() {
  redirect(ROUTES.admin.settings.diagnosis);
}
