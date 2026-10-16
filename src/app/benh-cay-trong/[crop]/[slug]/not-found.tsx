import Link from "next/link";
import { Button } from "@/shared/components/atoms";
import { ROUTES } from "@/shared/constants";

/** Bài / cây không có — header do layout /benh-cay-trong render. */
export default function ArticleNotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <h1 className="text-xl font-semibold">Không tìm thấy bài viết</h1>
      <p className="text-sm text-muted-foreground">Bài viết không tồn tại hoặc đã được đổi địa chỉ.</p>
      <Button asChild>
        <Link href={ROUTES.articles.index}>Xem bệnh cây trồng</Link>
      </Button>
    </div>
  );
}
