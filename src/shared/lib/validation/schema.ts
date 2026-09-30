import type { ObjectSchema, PartialSchemaMap } from "joi";
import { v } from "./joi";

/** Object schema gắn với input type `T` của feature (giữ tên field khớp type). */
export function schema<T extends object>(keys: PartialSchemaMap<T>): ObjectSchema<T> {
  return v.object<T>(keys);
}

export type TSchema<T extends object> = ObjectSchema<T>;
