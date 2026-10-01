import Link from "next/link";
import { Button } from "@/shared/components/atoms";
import { SiteHeader } from "@/shared/components/organisms";
import { ProfileLayout } from "@/shared/components/templates";
import { ROUTES } from "@/shared/constants";

export default function ProfileNotFound() {
  return (
    <ProfileLayout
      header={<SiteHeader actions={<></>} />}
      info={
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <h1 className="text-xl font-semibold">Không tìm thấy distributor</h1>
          <p className="text-sm text-muted-foreground">
            Distributor không tồn tại hoặc chưa được kích hoạt.
          </p>
          <Button asChild>
            <Link href={ROUTES.home}>Về trang chủ</Link>
          </Button>
        </div>
      }
    />
  );
}
