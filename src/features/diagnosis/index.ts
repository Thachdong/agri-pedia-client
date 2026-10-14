// Public API của feature `diagnosis` (chẩn đoán bệnh cây trồng + bài viết bệnh).
export { cropsQuery, diseaseQuery } from "./hooks/knowledge.queries";
export { useCrops } from "./hooks/use-crops";
export { useDisease } from "./hooks/use-disease";
export type { TCrop, TDisease } from "./types/knowledge.types";
