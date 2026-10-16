import { createHash, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import {
  ARTICLE_CACHE_TAG_MAX_LENGTH,
  ARTICLE_CACHE_TAG_PATTERN,
  ARTICLE_REVALIDATE_MAX_TAGS,
} from "@/features/article";
import { serverEnv } from "@/shared/config/env.server";
import { v } from "@/shared/lib/validation";

const SECRET_HEADER = "x-revalidate-secret";

const bodySchema = v.object<{ tags: string[] }>({
  tags: v
    .array()
    .items(v.string().max(ARTICLE_CACHE_TAG_MAX_LENGTH).pattern(ARTICLE_CACHE_TAG_PATTERN))
    .min(1)
    .max(ARTICLE_REVALIDATE_MAX_TAGS)
    .required(),
});

/** So sánh secret thời gian hằng — băm trước để 2 buffer luôn cùng độ dài (không lộ độ dài secret). */
function isValidSecret(received: string | null): boolean {
  const expected = serverEnv.REVALIDATE_SECRET;
  if (!expected || !received) return false;
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(received), digest(expected));
}

function error(status: number, code: string, message: string) {
  return NextResponse.json({ statusCode: status, code, message }, { status });
}

/**
 * Webhook từ NestJS khi bài viết đổi: `{ tags: string[] }` → revalidateTag(tag, "max") — lần mở kế tiếp
 * nhận trang cũ trong lúc render lại nền, lần sau nữa có nội dung mới. Không đi qua BFF forward (route cụ thể hơn).
 * Secret thiếu / sai → 401; body sai → 400. Self-host nhiều instance cần cache handler dùng chung.
 */
export async function POST(request: NextRequest) {
  if (!isValidSecret(request.headers.get(SECRET_HEADER))) {
    return error(401, "INVALID_REVALIDATE_SECRET", "Secret không hợp lệ");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error(400, "VALIDATION_ERROR", "Body phải là JSON");
  }

  const { value, error: validationError } = bodySchema.validate(body);
  if (validationError) return error(400, "VALIDATION_ERROR", validationError.message);

  const tags = [...new Set(value.tags)];
  for (const tag of tags) revalidateTag(tag, "max");
  return NextResponse.json({ revalidated: tags.length });
}
