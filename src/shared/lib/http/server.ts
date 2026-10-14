import "server-only";
import { cookies } from "next/headers";
import { serverEnv } from "@/shared/config/env.server";
import { ACCESS_TOKEN_COOKIE } from "@/shared/lib/auth/auth.constants";
import { createHttpClient } from "./create-http-client";

/** Client cho server (Server Components, route handlers): gọi thẳng NestJS kèm Bearer token từ cookie. */
export const serverHttp = createHttpClient({
  baseUrl: serverEnv.API_URL,
  getHeaders: async (): Promise<HeadersInit> => {
    const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
});
