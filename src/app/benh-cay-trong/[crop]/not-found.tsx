import Link from "next/link";
import { Button } from "@/shared/components/atoms";
import { ROUTES } from "@/shared/constants";

/** Cây không có bài viết — header do layout /benh-cay-trong render. */
export default function ArticleCropNotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <h1 className="text-xl font-semibold">Không tìm thấy cây trồng</h1>
      <p className="text-sm text-muted-foreground">Cây trồng này chưa có bài viết về bệnh hại.</p>
      <Button asChild>
        <Link href={ROUTES.articles.index}>Xem bệnh cây trồng</Link>
      </Button>
    </div>
  );
}
