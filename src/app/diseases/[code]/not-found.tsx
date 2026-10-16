import Link from "next/link";
import { Button } from "@/shared/components/atoms";
import { SiteHeader } from "@/shared/components/organisms";
import { ContentLayout } from "@/shared/components/templates";
import { ROUTES } from "@/shared/constants";

export default function DiseaseNotFound() {
  return (
    <ContentLayout header={<SiteHeader actions={<></>} />}>
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <h1 className="text-xl font-semibold">Không tìm thấy bài viết</h1>
        <p className="text-sm text-muted-foreground">Bệnh này chưa có trong thư viện kiến thức.</p>
        <Button asChild>
          <Link href={ROUTES.home}>Về trang chủ</Link>
        </Button>
      </div>
    </ContentLayout>
  );
}
