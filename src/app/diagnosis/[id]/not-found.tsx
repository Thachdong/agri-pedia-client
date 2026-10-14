import Link from "next/link";
import { Button } from "@/shared/components/atoms";
import { SiteHeader } from "@/shared/components/organisms";
import { ContentLayout } from "@/shared/components/templates";
import { ROUTES } from "@/shared/constants";

export default function DiagnosisNotFound() {
  return (
    <ContentLayout header={<SiteHeader actions={<></>} />}>
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <h1 className="text-xl font-semibold">Không tìm thấy kết quả chẩn đoán</h1>
        <p className="text-sm text-muted-foreground">Lần chẩn đoán không tồn tại hoặc không thuộc tài khoản của bạn.</p>
        <Button asChild>
          <Link href={ROUTES.diagnosis.list}>Xem lịch sử chẩn đoán</Link>
        </Button>
      </div>
    </ContentLayout>
  );
}
