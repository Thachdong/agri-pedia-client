import type { TApiSchema } from "@/shared/lib/http";

export type TLocationItem = TApiSchema<"LocationItemResponse">;
export type TProvince = TLocationItem;
export type TListProvincesResponse = TApiSchema<"ListProvincesResponse">;
export type TWard = TLocationItem;
export type TListWardsResponse = TApiSchema<"ListWardsResponse">;

/** Giá trị nhóm field địa chỉ trên form — lat/long chưa có khi chưa chọn vị trí. */
export type TAddressFieldsValue = {
  province: string;
  ward: string;
  houseNumber: string;
  lat?: number;
  long?: number;
};

export type TAddressFieldsErrors = Partial<Record<"province" | "ward" | "houseNumber" | "location", string>>;
