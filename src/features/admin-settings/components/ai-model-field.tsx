import { RotateCcwIcon } from "lucide-react";
import { Badge, Button, Input } from "@/shared/components/atoms";
import { FormField } from "@/shared/components/molecules";
import { AI_MODEL_ID_MAX_LENGTH } from "../constants/admin-settings.constants";

export type TAiModelFieldProps = {
  id: string;
  label: React.ReactNode;
  /** Bước dùng model này — hiện trên mô tả. */
  description?: React.ReactNode;
  /** Model env server dùng khi để trống. */
  defaultModel: string;
  /** Giá trị đang nhập — rỗng = dùng model env. */
  value: string;
  error?: string;
  disabled?: boolean;
  /** Props của input (vd `form.register(...)`). */
  inputProps: Omit<React.ComponentProps<"input">, "id" | "type">;
  /** Xoá input → quay về model env. */
  onUseDefault: () => void;
  className?: string;
};

/** Ô nhập model id của AI provider: rỗng = model env (`defaultModel`), nhãn cho biết đang dùng mặc định hay tuỳ chỉnh. */
export function AiModelField({
  id,
  label,
  description,
  defaultModel,
  value,
  error,
  disabled,
  inputProps,
  onUseDefault,
  className,
}: TAiModelFieldProps) {
  const isCustom = value.trim() !== "";

  return (
    <FormField
      id={id}
      className={className}
      label={
        <span className="flex flex-wrap items-center gap-2">
          {label}
          <Badge tone={isCustom ? "highlight" : "neutral"}>{isCustom ? "Tuỳ chỉnh" : "Mặc định"}</Badge>
        </span>
      }
      description={
        <>
          {description && <>{description} </>}
          Để trống = dùng model mặc định <code className="font-mono text-foreground">{defaultModel}</code>.
        </>
      }
      error={error}
    >
      {(control) => (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            {...control}
            {...inputProps}
            type="text"
            placeholder={defaultModel}
            maxLength={AI_MODEL_ID_MAX_LENGTH}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            className="font-mono sm:flex-1"
            disabled={disabled}
          />
          <Button type="button" variant="outline" onClick={onUseDefault} disabled={disabled || !isCustom}>
            <RotateCcwIcon aria-hidden />
            Dùng mặc định
          </Button>
        </div>
      )}
    </FormField>
  );
}
