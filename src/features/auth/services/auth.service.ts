import { http, type IHttpClient } from "@/shared/lib/http";
import type { TRegisterInput } from "../types/auth.types";

/** 201, body rỗng. */
export const register = (input: TRegisterInput, client: IHttpClient = http) =>
  client.post<void, TRegisterInput>("/auth/register", input);
