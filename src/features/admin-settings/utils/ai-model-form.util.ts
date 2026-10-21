/** Model API (null = model env) → giá trị input (rỗng = model env). */
export const toAiModelFormValue = (model: string | null) => model ?? "";

/** Giá trị input → body API: rỗng (sau trim) = null, server dùng model env. */
export const toAiModelInput = (value: string) => value.trim() || null;
