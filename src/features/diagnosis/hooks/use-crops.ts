import { useAppQuery } from "@/shared/lib/query";
import type { TCropsResponse } from "../types/knowledge.types";
import { cropsQuery } from "./knowledge.queries";

const toCrops = ({ crops }: TCropsResponse) => crops;

/** Tải nền cho nút header ở mọi trang → lỗi không bật thông báo global; nơi dùng tự báo khi cần. */
export const useCrops = () => useAppQuery({ ...cropsQuery(), select: toCrops, meta: { silent: true } });
