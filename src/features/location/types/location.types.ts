import type { TApiSchema } from "@/shared/lib/http";

export type TLocationItem = TApiSchema<"LocationItemResponse">;
export type TProvince = TLocationItem;
export type TListProvincesResponse = TApiSchema<"ListProvincesResponse">;
export type TWard = TLocationItem;
export type TListWardsResponse = TApiSchema<"ListWardsResponse">;
