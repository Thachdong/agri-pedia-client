import { cn } from "@/shared/lib/utils";
import { Label } from "../atoms";

/** Gắn vào control để label / mô tả / lỗi được đọc đúng bởi screen reader. */
export type TFormFieldControlProps = {
  id: string;
  "aria-invalid": boolean | undefined;
  "aria-describedby": string | undefined;
};

export type TFormFieldProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** id của control — label trỏ tới qua `htmlFor`. */
  id: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  /** Message lỗi đã dịch (từ schema / server). */
  error?: string;
  required?: boolean;
  children: (control: TFormFieldControlProps) => React.ReactNode;
};

export function FormField({ id, label, description, error, required, className, children, ...props }: TFormFieldProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)} {...props}>
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="text-destructive" aria-hidden>
            *
          </span>
        )}
      </Label>
      {children({ id, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy })}
      {description && (
        <p id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
