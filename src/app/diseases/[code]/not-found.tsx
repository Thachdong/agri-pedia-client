import Link from "next/link";
import { Button } from "@/shared/components/atoms";
import { SiteHeader } from "@/shared/components/organisms";
import { ContentLayout } from "@/shared/components/templates";
import { ROUTES } from "@/shared/constants";

/** Bệnh không có / chưa có bài viết. Header trung tính: route ISR không đọc phiên. */
export default function DiseaseNotFound() {
  return (
    <ContentLayout header={<SiteHeader actions={<></>} />}>
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <h1 className="text-xl font-semibold">Chưa có bài viết</h1>
        <p className="text-sm text-muted-foreground">Bệnh này chưa có bài viết trong thư viện.</p>
        <Button asChild>
          <Link href={ROUTES.articles.index}>Xem bệnh cây trồng</Link>
        </Button>
      </div>
    </ContentLayout>
  );
}
