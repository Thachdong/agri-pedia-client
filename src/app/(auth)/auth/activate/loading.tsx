import { AuthHeader } from "@/features/auth";
import { AuthLayout } from "@/shared/components/templates";

const BLOCK = "animate-pulse rounded-lg bg-muted";

export default function ActivateLoading() {
  return (
    <AuthLayout header={<AuthHeader />} title="Activate Account">
      <div className="flex flex-col gap-4" role="status" aria-label="Đang tải">
        <div className={`${BLOCK} mx-auto h-8 w-40`} />
        <div className="flex flex-col gap-1.5">
          <div className={`${BLOCK} h-4 w-24`} />
          <div className={`${BLOCK} h-8 w-full`} />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className={`${BLOCK} h-4 w-28`} />
          <div className={`${BLOCK} h-11 w-full`} />
        </div>
        <div className={`${BLOCK} mx-auto h-4 w-48`} />
        <div className={`${BLOCK} mx-auto h-9 w-full max-w-60`} />
      </div>
    </AuthLayout>
  );
}
