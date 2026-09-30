Feature: home-guest (feature folder `distributor`) | Page: /
Wireframe: specs/ui-ux/image-4.png (ui-ux.md §6)
API: GET /distributors/nearby (public, page-based: page/limit ≤ 50; response scope/source/total/items)
Scope: GUEST only. Không phân nhánh theo session — header (1)–(4) logged-in + UI farmer/đã login làm sau. Filter (6) chưa làm (xem Open questions).
Decisions:
  - Mount → xin quyền định vị 1 lần. Cho phép → gửi lat/long (server tự áp radius 30km → fallback nationwide_by_distance). Từ chối/không hỗ trợ → không gửi gì (scope nationwide).
  - Query chỉ chạy khi định vị đã resolve (tránh gọi 2 lần).
  - Spec nói cursor, API thực tế page-based → useInfiniteQuery theo page, hết khi đã load đủ `total`.
  - API chưa có avgRating/categoryIds → card không có rating; filter categories bỏ.
  - Map + list dùng chung 1 query; click marker → highlight + scroll item; click card → /profile/<userId>.
  - API trả address.province = codename, avatar = media id (chưa có endpoint đổi URL) → card hiện chữ cái đầu, tên tỉnh tra qua useProvinces.
  - scope = nationwide_by_distance → hiện note "Không có distributor trong 30km, hiển thị gần nhất".
Foundation: đủ — không cần data-wrapper / bff / design-token (dùng primary, highlight, highlight-subtle, card-normal, card-highlight).

- [x] 1. [feature-scaffold]      feature `distributor` — layers: components, hooks, services, types, constants, utils
- [x] 2. [feature-api]           GET /distributors/nearby → TNearbyDistributor, TNearbyParams, getNearbyDistributors, useNearbyDistributors (infinite, page-based); keys distributors.nearby(params)
- [x] 3. [shared-unit]           constant BUSINESS_TYPE_OPTIONS/LABELS + type TBusinessType (chuyển từ auth sang shared) + util formatDistance (shared)
- [x] 4. ~~[shared-unit] hook useGuestLocation~~ — bỏ: chỉ dùng 1 chỗ, gộp inline vào step 10
- [x] 5. [atomic-component]      atom      Avatar             (new, shared)
- [x] 6. [atomic-component]      molecule  DistributorCard    (new, feature)
- [x] 7. [atomic-component]      organism  DistributorList    (new, feature) — infinite scroll, highlight + scroll tới item chọn, loading/empty/error, note scope; tra tên tỉnh từ codename qua useProvinces (@/features/location)
- [x] 8. [atomic-component]      organism  MarkerMap          (new, shared) — leaflet wrapper: markers + user marker + select + fit view; lint rule 5 mở cho marker-map (thay DistributorMap; mapping distributor → markers inline ở step 10)
- [x] 9. [atomic-component]      organism  SiteHeader         (new, shared) — logo + Login / Register (guest); slot cho phần đã login sau này
- [x] 10. [atomic-component]     organism  DistributorExplorer (new, feature) — xin định vị 1 lần khi mount (inline, dùng shared useGeolocation) + useNearbyDistributors + MarkerMap (map distributor → markers inline) + list, state selected chung → compound: DistributorExplorerProvider + DistributorExplorerMap + DistributorExplorerList (page đặt 2 panel vào slot template); chờ định vị tối đa 8s
- [x] 11. [page]                 template MapListLayout + page / ← DistributorExplorer
- [x] 12. [arch-review]
- [x] 13. [atomic-component]     organism  MarkerMap + MapPicker (update, shared) — user marker nhấp nháy + nhãn "Bạn ở đây" luôn hiện (prop userLabel); fix arch-review: `white` trong SVG → token, named export cho *-view (dynamic .then)
- [x] 14. [atomic-component]     organism  MarkerMap + MapPicker (update, shared) — giới hạn bản đồ trong VN (maxBounds + minZoom, gồm Hoàng Sa/Trường Sa; constant VN_BOUNDS shared); fit bỏ qua vị trí user nằm ngoài VN

Components (in order):
  [atom]      Avatar               new    shared
  [atom]      Button               reuse  shared
  [molecule]  DistributorCard      new    feature distributor
  [organism]  DistributorList      new    feature distributor
  [organism]  MarkerMap            new    shared (thay DistributorMap — leaflet chỉ được import trong wrapper shared)
  [organism]  SiteHeader           new    shared
  [organism]  DistributorExplorer  new    feature distributor
  [template]  MapListLayout        new    shared
  [page]      HomePage             new    app/page.tsx

Resolved:
  - User đã login: chưa xử lý đợt này (không phân nhánh theo session; header chỉ có Login / Register).

  - Filter (6): bỏ đợt này, để trống vùng (6).
  - Mobile (<md): map trên (~40vh), list dưới.
