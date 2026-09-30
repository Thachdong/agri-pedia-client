/** `details.blockUntil` (ISO) của OTP_BLOCKED → "HH:mm"; không có / sai định dạng → null. */
export const formatBlockUntil = (details: unknown) => {
  const blockUntil = (details as { blockUntil?: unknown } | undefined)?.blockUntil;
  if (typeof blockUntil !== "string") return null;
  const date = new Date(blockUntil);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};

/** `details.issuedAt` (ISO) của OTP_ALREADY_REQUESTED → epoch ms; không có / sai định dạng → null. */
export const getIssuedAt = (details: unknown) => {
  const issuedAt = (details as { issuedAt?: unknown } | undefined)?.issuedAt;
  if (typeof issuedAt !== "string") return null;
  const time = new Date(issuedAt).getTime();
  return Number.isNaN(time) ? null : time;
};
