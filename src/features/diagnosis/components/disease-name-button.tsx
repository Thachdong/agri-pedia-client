import { cn } from "@/shared/lib/utils";

export type TDiseaseNameButtonProps = Omit<React.ComponentProps<"button">, "type"> & {
  name: string;
  variantName?: string | null;
};

/** Tên bệnh dạng link — bấm để mở báo cáo bệnh (dialog). */
export function DiseaseNameButton({ name, variantName, className, ...props }: TDiseaseNameButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-sm text-left font-medium text-highlight underline underline-offset-4 decoration-highlight/40 outline-none hover:decoration-highlight focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    >
      {name}
      {variantName && <span className="font-normal"> — {variantName}</span>}
      <span className="sr-only"> (xem thông tin bệnh)</span>
    </button>
  );
}
