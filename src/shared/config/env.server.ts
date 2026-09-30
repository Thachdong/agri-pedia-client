import "server-only";
import { v } from "@/shared/lib/validation";

type TServerEnv = {
  /** Base URL của NestJS API, không có dấu `/` cuối. */
  API_URL: string;
};

const serverEnvSchema = v.object<TServerEnv>({
  API_URL: v
    .string()
    .uri({ scheme: ["http", "https"] })
    .replace(/\/+$/, "")
    .required(),
});

const { value, error } = serverEnvSchema.validate(
  { API_URL: process.env.API_URL },
  { stripUnknown: true },
);

if (error) {
  throw new Error(`Invalid server env: ${error.message}. Xem .env.example.`);
}

/** Biến môi trường chỉ dùng ở server (route handlers, Server Components). */
export const serverEnv: Readonly<TServerEnv> = value;
