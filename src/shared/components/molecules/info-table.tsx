import { cn } from "@/shared/lib/utils";

export type TInfoTableItem = {
  /** Key ổn định cho list; mặc định dùng `label` nếu là chuỗi. */
  id?: string;
  label: React.ReactNode;
  /** `null` / `undefined` / "" → hiện `emptyText`. */
  value: React.ReactNode;
};

export type TInfoTableProps = Omit<React.ComponentProps<"dl">, "children"> & {
  items: TInfoTableItem[];
  emptyText?: string;
};

const isEmpty = (value: React.ReactNode) => value === null || value === undefined || value === "";

/**
 * Bảng thông tin nhãn / giá trị (vd. phần thông tin distributor — ui-ux.md §7).
 * Mobile: nhãn trên, giá trị dưới; từ `sm`: 2 cột, nhãn ~1/3.
 */
export function InfoTable({ items, emptyText = "Chưa cập nhật", className, ...props }: TInfoTableProps) {
  return (
    <dl
      className={cn("divide-y divide-border-subtle overflow-hidden rounded-lg border border-border-subtle", className)}
      {...props}
    >
      {items.map(({ id, label, value }, index) => (
        <div
          key={id ?? (typeof label === "string" ? label : index)}
          className="grid grid-cols-1 sm:grid-cols-[minmax(10rem,1fr)_2fr]"
        >
          <dt className="bg-surface px-4 pt-3 pb-1 text-sm font-medium text-surface-foreground sm:py-3">{label}</dt>
          <dd className="min-w-0 px-4 pt-1 pb-3 text-sm break-words whitespace-pre-line sm:py-3">
            {isEmpty(value) ? <span className="text-muted-foreground">{emptyText}</span> : value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
