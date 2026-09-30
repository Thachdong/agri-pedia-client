import { Tabs, TabsList, TabsTrigger } from "@/shared/components/atoms";
import { cn } from "@/shared/lib/utils";
import { LOGIN_TYPE_LABELS, LOGIN_TYPES } from "../constants/auth.constants";
import type { TLoginType } from "../types/auth.types";

export type TLoginTypeTabsProps = {
  value: TLoginType;
  /** Form tự xử lý phần còn lại khi đổi tab (clear identifier, đổi label/validate). */
  onValueChange: (value: TLoginType) => void;
  disabled?: boolean;
  className?: string;
};

const isLoginType = (value: string): value is TLoginType => (LOGIN_TYPES as readonly string[]).includes(value);

export function LoginTypeTabs({ value, onValueChange, disabled, className }: TLoginTypeTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) => isLoginType(next) && onValueChange(next)}
      className={cn("items-center", className)}
    >
      <TabsList aria-label="Đăng nhập bằng">
        {LOGIN_TYPES.map((type) => (
          <TabsTrigger key={type} value={type} disabled={disabled} className="px-4">
            {LOGIN_TYPE_LABELS[type]}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
