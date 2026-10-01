// Public API của feature `distributor` (danh sách + map ở trang "/", profile public ở /profile/<id>).
export {
  DistributorExplorerList,
  DistributorExplorerMap,
  DistributorExplorerProvider,
  type TDistributorExplorerProviderProps,
  type TExplorerOrigin,
} from "./components/distributor-explorer";
export { distributorProfileQuery, nearbyDistributorsQuery } from "./hooks/distributor.queries";
export { useDistributorProfile } from "./hooks/use-distributor-profile";
export { useNearbyDistributors } from "./hooks/use-nearby-distributors";
export type {
  TDistributorProfile,
  TNearbyDistributor,
  TNearbyDistributorsParams,
  TNearbyDistributorsView,
  TNearbyScope,
} from "./types/distributor.types";
