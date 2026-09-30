import { http, type IHttpClient } from "@/shared/lib/http";
import type { TActivateInput, TRegisterInput } from "../types/auth.types";

/** 201, body rỗng. */
export const register = (input: TRegisterInput, client: IHttpClient = http) =>
  client.post<void, TRegisterInput>("/auth/register", input);

/** 200, body rỗng — account DISTRIBUTOR chuyển sang ACTIVE. */
export const activate = (input: TActivateInput, client: IHttpClient = http) =>
  client.post<void, TActivateInput>("/auth/activate", input);
