import { joiResolver } from "@hookform/resolvers/joi";
import { useForm, type FieldValues, type UseFormProps, type UseFormReturn } from "react-hook-form";
import type { TSchema } from "@/shared/lib/validation";

/**
 * `context` (tuỳ chọn) đi vào joi qua `$tên` (vd. `v.ref("$maxImages")`) — cho giới hạn lấy từ server; react-hook-form
 * đọc options mỗi render nên context đổi thì lần validate sau dùng giá trị mới.
 */
export type TAppFormOptions<T extends FieldValues, TContext = unknown> = Omit<UseFormProps<T, TContext>, "resolver"> & {
  /** Joi schema của feature (`features/<x>/schemas/*.schema.ts`) — nguồn validate duy nhất. */
  schema: TSchema<T>;
};

export type TAppForm<T extends FieldValues, TContext = unknown> = UseFormReturn<T, TContext>;

export function useAppForm<T extends FieldValues, TContext = unknown>({
  schema,
  mode = "onTouched",
  ...options
}: TAppFormOptions<T, TContext>): TAppForm<T, TContext> {
  return useForm<T, TContext>({ ...options, mode, resolver: joiResolver(schema) });
}
