import { useAppQuery } from "@/shared/lib/query";
import { distributorProfileQuery } from "./distributor.queries";

/** `enabled: false` → không gọi API (vd. chưa biết id). */
export const useDistributorProfile = (distributorId: string, { enabled = true }: { enabled?: boolean } = {}) =>
  useAppQuery({ ...distributorProfileQuery(distributorId), enabled });
