import Joi from "joi";
import { messages } from "./messages";

/** Joi instance dùng trong toàn project — chỉ import `v` từ `@/shared/lib/validation`, không import `joi` trực tiếp. */
export const v: Joi.Root = Joi.defaults((schema) =>
  schema.options({
    abortEarly: false,
    errors: { wrap: { label: false } },
    messages,
  }),
);
