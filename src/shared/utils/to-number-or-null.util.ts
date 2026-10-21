/**
 * `setValueAs` cho ô số của form: ô rỗng → null (schema báo "Vui lòng nhập…") thay vì NaN / 0; còn lại → Number.
 */
export const toNumberOrNull = (value: unknown) => (value === "" || value === null ? null : Number(value));
