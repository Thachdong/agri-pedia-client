import { redirect } from "next/navigation";
import { ROUTES } from "@/shared/constants";

/** /admin → danh sách bài viết (mục duy nhất đang có). */
export default function AdminHomePage() {
  redirect(ROUTES.admin.articles.list());
}
