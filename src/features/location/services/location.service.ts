import { http, type IHttpClient } from "@/shared/lib/http";
import type { TListProvincesResponse } from "../types/location.types";

export const getProvinces = (client: IHttpClient = http) => client.get<TListProvincesResponse>("/provinces");
