import "server-only";
import { v } from "@/shared/lib/validation";

type TServerEnv = {
  /** Base URL của NestJS API, không có dấu `/` cuối. */
  API_URL: string;
  /** Khớp AUTH_REFRESH_TOKEN_TTL_SECONDS của server — maxAge của cookie refresh token. */
  AUTH_REFRESH_TOKEN_TTL_SECONDS: number;
};

const serverEnvSchema = v.object<TServerEnv>({
  API_URL: v
    .string()
    .uri({ scheme: ["http", "https"] })
    .replace(/\/+$/, "")
    .required(),
  AUTH_REFRESH_TOKEN_TTL_SECONDS: v.number().integer().positive().default(2_592_000),
});

const { value, error } = serverEnvSchema.validate(
  {
    API_URL: process.env.API_URL,
    AUTH_REFRESH_TOKEN_TTL_SECONDS: process.env.AUTH_REFRESH_TOKEN_TTL_SECONDS,
  },
  { stripUnknown: true },
);

if (error) {
  const issues = error.details.map((detail) => `${detail.path.join(".")}: ${detail.message}`).join("; ");
  throw new Error(`Invalid server env — ${issues}. Xem .env.example.`);
}

/** Biến môi trường chỉ dùng ở server (route handlers, Server Components). */
export const serverEnv: Readonly<TServerEnv> = value;
