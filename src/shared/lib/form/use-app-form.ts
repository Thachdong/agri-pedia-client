import { joiResolver } from "@hookform/resolvers/joi";
import { useForm, type FieldValues, type UseFormProps, type UseFormReturn } from "react-hook-form";
import type { TSchema } from "@/shared/lib/validation";

export type TAppFormOptions<T extends FieldValues> = Omit<UseFormProps<T>, "resolver"> & {
  /** Joi schema của feature (`features/<x>/schemas/*.schema.ts`) — nguồn validate duy nhất. */
  schema: TSchema<T>;
};

export type TAppForm<T extends FieldValues> = UseFormReturn<T>;

export function useAppForm<T extends FieldValues>({
  schema,
  mode = "onTouched",
  ...options
}: TAppFormOptions<T>): TAppForm<T> {
  return useForm<T>({ ...options, mode, resolver: joiResolver(schema) });
}
