import { Loader2Icon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button as UiButton } from "../ui/button";

type TUiButtonProps = React.ComponentProps<typeof UiButton>;
type TUiVariant = Exclude<NonNullable<TUiButtonProps["variant"]>, "default">;

export type TButtonProps = Omit<TUiButtonProps, "variant"> & {
  /** `normal` = nút chính (btn-normal), `highlight` = nút nhấn mạnh (btn-highlight). */
  variant?: "normal" | "highlight" | TUiVariant;
  /** Hiện spinner + disabled + aria-busy. Bỏ qua spinner khi `asChild`. */
  loading?: boolean;
};

const TONE_CLASSES = {
  normal: "btn-normal hover:bg-primary/90",
  highlight: "btn-highlight hover:bg-highlight/90",
} as const;

export function Button({
  variant = "normal",
  loading = false,
  disabled,
  asChild,
  className,
  children,
  ...props
}: TButtonProps) {
  const isTone = variant === "normal" || variant === "highlight";

  return (
    <UiButton
      variant={isTone ? "default" : variant}
      className={cn(isTone && TONE_CLASSES[variant], className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      asChild={asChild}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading && <Loader2Icon className="animate-spin" aria-hidden />}
          {children}
        </>
      )}
    </UiButton>
  );
}
