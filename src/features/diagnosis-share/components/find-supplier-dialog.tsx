"use client";

import { LocateFixedIcon, MapIcon, RefreshCwIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  DistributorCard,
  type TNearbyDistributor,
  type TNearbyDistributorsParams,
  useNearbyDistributors,
} from "@/features/distributor";
import { useProvinces, useWards } from "@/features/location";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/shared/components/atoms";
import { Callout, FormField } from "@/shared/components/molecules";
import { useGeolocation, useInfiniteSentinel } from "@/shared/hooks";

type TSearchMode = "nearby" | "area";

/** Radix Select không nhận value rỗng cho item → giá trị riêng cho "mọi phường/xã". */
const ALL_WARDS = "__all__";

export type TFindSupplierDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Distributor được chọn (bên gọi xác nhận rồi gửi report). */
  onChoose: (distributor: TNearbyDistributor) => void;
};

/**
 * Tìm nhà cung cấp (GET /distributors/nearby): "Gần tôi" (định vị trình duyệt) | "Theo tỉnh thành" (tỉnh + phường/xã
 * tuỳ chọn). Không có ai trong phạm vi → server trả toàn quốc, dialog ghi chú điều đó.
 */
export function FindSupplierDialog({ open, onOpenChange, onChoose }: TFindSupplierDialogProps) {
  const [mode, setMode] = useState<TSearchMode>("nearby");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col gap-4 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tìm nhà cung cấp</DialogTitle>
          <DialogDescription>Chọn nhà cung cấp để gửi báo cáo chẩn đoán.</DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(value) => setMode(value as TSearchMode)}>
          <TabsList aria-label="Cách tìm" className="grid h-10! w-full grid-cols-2">
            <TabsTrigger value="nearby" className="h-full gap-2">
              <LocateFixedIcon aria-hidden />
              Gần tôi
            </TabsTrigger>
            <TabsTrigger value="area" className="h-full gap-2">
              <MapIcon aria-hidden />
              Theo tỉnh thành
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Mount theo tab → đổi tab không giữ request định vị / lựa chọn tỉnh cũ chạy ngầm. */}
        {open && (mode === "nearby" ? <NearbySearch onChoose={onChoose} /> : <AreaSearch onChoose={onChoose} />)}
      </DialogContent>
    </Dialog>
  );
}

type TSearchProps = { onChoose: (distributor: TNearbyDistributor) => void };

function NearbySearch({ onChoose }: TSearchProps) {
  const { status, coords, error, request } = useGeolocation();

  // Xin vị trí ngay khi mở tab.
  useEffect(() => {
    void request();
  }, [request]);

  if (status === "error") {
    return (
      <Callout
        tone="danger"
        role="alert"
        title="Không lấy được vị trí"
        action={
          <Button size="sm" variant="outline" onClick={() => void request()}>
            <RefreshCwIcon aria-hidden />
            Thử lại
          </Button>
        }
      >
        {error} Bạn có thể tìm theo tỉnh thành.
      </Callout>
    );
  }

  if (!coords) {
    return (
      <p aria-busy className="py-6 text-center text-sm text-muted-foreground">
        Đang lấy vị trí của bạn…
      </p>
    );
  }

  return <SupplierResults params={{ lat: coords.lat, long: coords.long }} onChoose={onChoose} />;
}

function AreaSearch({ onChoose }: TSearchProps) {
  const [province, setProvince] = useState("");
  const [ward, setWard] = useState(ALL_WARDS);
  const provinces = useProvinces();
  const wards = useWards(province || undefined);

  const params = useMemo<TNearbyDistributorsParams>(
    () => ({ provinceCode: province, ...(ward !== ALL_WARDS && { wardCode: ward }) }),
    [province, ward],
  );

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField id="supplier-province" label="Tỉnh/Thành phố" required>
          {(control) => (
            <Select
              value={province}
              onValueChange={(next) => {
                setProvince(next);
                setWard(ALL_WARDS);
              }}
              disabled={!provinces.data}
            >
              <SelectTrigger className="w-full" {...control}>
                <SelectValue placeholder={provinces.isPending ? "Đang tải…" : "Chọn tỉnh/thành phố"} />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-72">
                {provinces.data?.map((item) => (
                  <SelectItem key={item.codename} value={item.codename}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FormField>
        <FormField id="supplier-ward" label="Phường/Xã">
          {(control) => (
            <Select value={ward} onValueChange={setWard} disabled={!province || !wards.data}>
              <SelectTrigger className="w-full" {...control}>
                <SelectValue placeholder={province && wards.isPending ? "Đang tải…" : "Tất cả phường/xã"} />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-72">
                <SelectItem value={ALL_WARDS}>Tất cả phường/xã</SelectItem>
                {wards.data?.map((item) => (
                  <SelectItem key={item.codename} value={item.codename}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FormField>
      </div>

      {provinces.isError && (
        <Callout
          tone="danger"
          role="alert"
          action={
            <Button size="sm" variant="outline" onClick={() => void provinces.refetch()}>
              Thử lại
            </Button>
          }
        >
          Không tải được danh sách tỉnh/thành.
        </Callout>
      )}

      {province ? (
        <SupplierResults params={params} onChoose={onChoose} />
      ) : (
        <p className="py-6 text-center text-sm text-muted-foreground">Chọn tỉnh/thành phố để xem nhà cung cấp.</p>
      )}
    </>
  );
}

/** Kết quả theo phạm vi; ngoài phạm vi (server lùi về toàn quốc) → ghi chú. */
const FALLBACK_SCOPES = new Set(["nationwide", "nationwide_by_distance"]);

function SupplierResults({ params, onChoose }: TSearchProps & { params: TNearbyDistributorsParams }) {
  const query = useNearbyDistributors(params);
  const { data: provinces } = useProvinces();
  const provinceNames = useMemo(() => new Map(provinces?.map((item) => [item.codename, item.name])), [provinces]);
  const sentinelRef = useInfiniteSentinel<HTMLLIElement>(query);

  if (query.isPending) {
    return (
      <ul aria-busy aria-label="Đang tìm nhà cung cấp" className="flex flex-col gap-2">
        {[0, 1, 2].map((index) => (
          <li key={index} className="h-18 animate-pulse rounded-lg bg-muted" />
        ))}
      </ul>
    );
  }

  if (!query.data) {
    return (
      <Callout
        tone="danger"
        role="alert"
        title="Không tìm được nhà cung cấp"
        action={
          <Button size="sm" variant="outline" onClick={() => void query.refetch()}>
            <RefreshCwIcon aria-hidden />
            Thử lại
          </Button>
        }
      >
        {query.error?.message}
      </Callout>
    );
  }

  const { items, scope } = query.data;
  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">Chưa có nhà cung cấp nào.</p>;
  }

  return (
    <div className="scrollbar-thin -mx-1 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-1">
      {FALLBACK_SCOPES.has(scope) && (
        <Callout tone="neutral">Không có nhà cung cấp trong khu vực này — đang hiện nhà cung cấp toàn quốc.</Callout>
      )}
      <ul className="flex flex-col gap-2">
        {items.map((distributor) => (
          <li key={distributor.userId}>
            <DistributorCard
              distributor={distributor}
              provinceName={provinceNames.get(distributor.address.province)}
              onChoose={onChoose}
            />
          </li>
        ))}
        <li ref={sentinelRef} className="flex justify-center text-xs text-muted-foreground">
          {query.isFetchingNextPage && "Đang tải thêm…"}
          {query.isFetchNextPageError && (
            <Button variant="ghost" size="sm" onClick={() => void query.fetchNextPage()}>
              Tải thêm thất bại — thử lại
            </Button>
          )}
        </li>
      </ul>
    </div>
  );
}
