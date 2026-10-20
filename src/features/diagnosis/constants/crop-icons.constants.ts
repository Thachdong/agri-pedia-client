import { SproutIcon, TreeDeciduousIcon, WheatIcon, type LucideIcon } from "lucide-react";

/** Icon theo cây (`code` của GET /knowledge/crops). */
const CROP_ICONS: Record<string, LucideIcon> = {
  RICE: WheatIcon,
  DURIAN: TreeDeciduousIcon,
};

/** Cây mới chưa có icon riêng dùng mầm cây. */
export const cropIcon = (code: string): LucideIcon => CROP_ICONS[code] ?? SproutIcon;
