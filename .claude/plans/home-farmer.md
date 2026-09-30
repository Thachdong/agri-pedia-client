Feature: home-farmer | Page: / (đã login, role FARMER)
Wireframe: specs/ui-ux/image-4.png (ui-ux.md §6 — header (1)–(4) + map/list); Chat modal theo ui-ux.md §7 M2 (chưa có ảnh)
API: GET /users/me, POST /auth/logout (BFF), POST /auth/realtime-ticket, GET /notifications, PATCH /notifications/:id/read, PATCH /notifications/read-all,
     GET /chat/rooms, GET /chat/rooms/:roomId/messages, socket: chat.message.send, chat.room.enter/leave, notification.created, chat.message.received
Decisions:
  - Page "/" rẽ nhánh trên server theo cookie phiên (guest không gọi /users/me — client http đẩy về /login khi 401). Page thành dynamic.
  - Có phiên: lấy /users/me bằng serverHttp (best effort).
    + DISTRIBUTOR → redirect /profile/<id> (server; nếu server không lấy được me thì client guard redirect sau useMe).
    + FARMER → header đầy đủ + map/list theo primary address.
  - Map/list farmer: không xin định vị, không gửi lat/long → server dùng primary address. Marker người xem = me.address, nhãn "Địa chỉ của bạn". Address null → toàn quốc, không marker.
  - Realtime: browser lấy ticket qua BFF catch-all (POST /api/auth/realtime-ticket → NestJS, Bearer từ cookie, tự refresh 401), mở socket.io với `auth: { ticket }`, ticket mới cho mỗi lần connect/reconnect.
    Socket kết nối thẳng NestJS (NEXT_PUBLIC_REALTIME_URL), `transports: ["websocket"]` (gateway không cấu hình CORS; websocket không bị CORS).
    socket.io-client wrap trong src/shared/lib/realtime (lint cấm import ngoài wrapper).
  - notification.created → prepend vào cache notifications; chat.message.received → append vào cache messages của room + invalidate chat.rooms.
  - API không có unread count cho notification → badge đếm isRead=false trong các trang đã tải; trang đầu đầy + toàn unread → "20+".
  - Chat: header (2) → popover danh sách rooms → click room → Chat modal (M2): tin nhắn (infinite, cũ hơn khi cuộn lên), gửi qua socket (ack), enter khi mở / leave khi đóng.
    Chat modal dựng để trang /profile/<id> dùng lại (mở theo roomId hoặc receiverId).
  - Room có `otherUsername` (nullable → "Người dùng") + `otherUserAvatar` (media id như distributor → hiện chữ cái đầu tới khi có URL).
  - Logout: POST /api/auth/logout (BFF) → window.location.assign("/") (full reload: xoá cache, ngắt socket; tránh query đang mount refetch → 401 → /login).
Foundation: có http/query/form, BFF auth + forward, proxy. Thiếu: realtime wrapper (socket.io-client), lint rule cho nó, shadcn popover + dropdown-menu.

- [x] 1. [bff-auth]             server helper hasSession() trong shared/lib/auth (cookie access|refresh)
- [x] 2. [data-wrapper]         realtime: socket.io-client → src/shared/lib/realtime — RealtimeProvider (connect khi có phiên, ticket qua BFF mỗi lần connect), useRealtimeEvent, emitWithAck; env NEXT_PUBLIC_REALTIME_URL
- [x] 3. ~~[arch-lint-setup] cấm socket.io-client ngoài wrapper~~ — gộp vào step 2 (skill data-wrapper tự thêm vào WRAPPED)
- [x] 4. [feature-scaffold]     features `user`, `notification`, `chat` — layers: components, hooks, services, types (+ schemas cho chat)
- [x] 5. [feature-api]          GET /users/me → TUserProfile, getMe, meQuery, useMe; keys users.me
- [x] 6. [feature-api]          POST /auth/logout (BFF) → useLogout (feature auth); onSuccess tải lại toàn trang "/" (xoá cache + ngắt socket + nhánh guest)
- [x] 7. [feature-api]          GET /notifications → TNotification, useNotifications (infinite cursor); keys notifications.list
- [x] 8. [feature-api]          PATCH /notifications/:id/read → useMarkNotificationRead (optimistic setQueryData, rollback onError)
- [x] 9. [feature-api]          PATCH /notifications/read-all → useMarkAllNotificationsRead (optimistic, invalidates notifications.all)
- [x] 10. [feature-api]         GET /chat/rooms → TChatRoom, useChatRooms (infinite cursor); keys chat.rooms
- [x] 11. [feature-api]         GET /chat/rooms/:roomId/messages → TChatMessage, useRoomMessages (infinite cursor, cũ dần); keys chat.messages(roomId)
- [x] 12. [feature-api]         socket chat.message.send → useSendMessage (emitWithAck; cập nhật messages + invalidate chat.rooms; room mới khi gửi bằng receiverId)
- [x] 13. [validation-schema]   chatMessageSchema (message 1..2000 sau trim)
- [x] 14. [shared-unit]         hook useNotificationRealtime (feature notification) — notification.created → prepend cache, reconnect → refetch; wrapper query thêm useAppQueryClient
- [ ] 15. [shared-unit]         hook useChatRealtime (feature chat) — chat.message.received → append messages cache + invalidate rooms
- [ ] 16. [atomic-component]    atom      Popover + DropdownMenu   (new, shared — shadcn qua atoms)
- [ ] 17. [atomic-component]    atom      CountBadge               (new, shared) — số đếm, "99+"
- [ ] 18. [atomic-component]    molecule  IconBadgeButton          (new, shared) — icon button + CountBadge, aria-label kèm số
- [ ] 19. [atomic-component]    molecule  NotificationItem         (new, feature notification)
- [ ] 20. [atomic-component]    organism  NotificationMenu         (new, feature notification) — popover, click → mark read, đọc tất cả, infinite, loading/empty/error
- [ ] 21. [atomic-component]    molecule  ChatRoomItem             (new, feature chat)
- [ ] 22. [atomic-component]    molecule  ChatMessageBubble        (new, feature chat)
- [ ] 23. [atomic-component]    organism  ChatModal                (new, feature chat) — M2: messages infinite (cuộn lên), form gửi (useAppForm + schema), enter/leave room, loading/empty/error
- [ ] 24. [atomic-component]    organism  ChatRoomsMenu            (new, feature chat) — popover rooms, badge totalUnread, click → ChatModal
- [ ] 25. [atomic-component]    organism  UserMenu                 (new, feature user) — username + avatar, dropdown: Trang cá nhân, Đăng xuất
- [ ] 26. [atomic-component]    organism  DistributorExplorerProvider (update, feature distributor) — origin "geolocation" (guest) | "profile" (useMe → address)
- [ ] 27. [page]                page / — rẽ nhánh hasSession: guest như cũ | FARMER: RealtimeProvider + SiteHeader actions (NotificationMenu, ChatRoomsMenu, UserMenu) + explorer "profile" | DISTRIBUTOR: redirect /profile/<id>
- [ ] 28. [arch-review]

Components (in order):
  [atom]      Popover, DropdownMenu     new    shared (shadcn)
  [atom]      CountBadge                new    shared
  [atom]      Avatar, Button, Dialog, Textarea  reuse  shared
  [molecule]  IconBadgeButton           new    shared
  [molecule]  NotificationItem          new    feature notification
  [molecule]  ChatRoomItem              new    feature chat
  [molecule]  ChatMessageBubble         new    feature chat
  [organism]  NotificationMenu          new    feature notification
  [organism]  ChatModal                 new    feature chat
  [organism]  ChatRoomsMenu             new    feature chat
  [organism]  UserMenu                  new    feature user
  [organism]  SiteHeader                reuse  shared (slot actions)
  [organism]  MarkerMap, DistributorExplorerMap/List  reuse
  [organism]  DistributorExplorerProvider  update  feature distributor
  [template]  MapListLayout             reuse  shared
  [page]      HomePage                  update app/page.tsx

Resolved:
  - ChatRoomResponse đã có otherUsername / otherUserAvatar (specs/openapi.json) — step 10 chạy `npm run gen:api` trước.
  - Socket URL: env NEXT_PUBLIC_REALTIME_URL.
