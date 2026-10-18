import Link from "next/link";
import { Button } from "@/shared/components/atoms";
import { ROUTES } from "@/shared/constants";

/** Bài / bệnh không tồn tại trong khu quản trị — header / sidebar do layout /admin render. */
export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <h1 className="text-xl font-semibold">Không tìm thấy</h1>
      <p className="text-sm text-muted-foreground">Bài viết hoặc bệnh này không tồn tại.</p>
      <Button asChild>
        <Link href={ROUTES.admin.articles.list()}>Về danh sách bài viết</Link>
      </Button>
    </div>
  );
}
