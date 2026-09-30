import { http, type IHttpClient } from "@/shared/lib/http";
import type { TListProvincesResponse, TListWardsResponse } from "../types/location.types";

export const getProvinces = (client: IHttpClient = http) => client.get<TListProvincesResponse>("/provinces");

export const getWards = (provinceCode: string, client: IHttpClient = http) =>
  client.get<TListWardsResponse>(`/provinces/${encodeURIComponent(provinceCode)}/wards`);
