"use client";

import { RefreshCwIcon, ScanSearchIcon } from "lucide-react";
import { useState } from "react";
import { Button, Tabs, TabsList, TabsTrigger } from "@/shared/components/atoms";
import { Callout, LoginRequiredDialog } from "@/shared/components/molecules";
import { cn } from "@/shared/lib/utils";
import { cropIcon } from "../constants/crop-icons.constants";
import { useCrops } from "../hooks/use-crops";
import { useDiagnosisSettings } from "../hooks/use-diagnosis-settings";
import type { TCrop } from "../types/knowledge.types";
import { DiagnosisForm } from "./diagnosis-form";

/** Admin chưa chọn cây mặc định (hoặc cây đó không còn hỗ trợ) → lúa, rồi tới cây đầu danh sách. */
const FALLBACK_CROP = "RICE";

const pickDefaultCrop = (crops: TCrop[], preferred: string | null | undefined) =>
  [preferred, FALLBACK_CROP].map((code) => crops.find((crop) => crop.code === code)).find(Boolean) ?? crops[0];

export type THomeDiagnosisPanelProps = {
  /** Guest: thấy form với cây mặc định, đổi cây / thao tác form → dialog mời đăng nhập. */
  guest?: boolean;
  className?: string;
};

/**
 * Khối chẩn đoán ở trang chủ: chọn cây (GET /knowledge/crops, mặc định theo GET /diagnoses/settings) + form chẩn đoán
 * inline. Đổi cây làm mới form (bộ phận ảnh khác nhau giữa các cây).
 */
export function HomeDiagnosisPanel({ guest = false, className }: THomeDiagnosisPanelProps) {
  const crops = useCrops();
  const settings = useDiagnosisSettings();
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  // Lỗi settings không chặn form — dùng cây mặc định của client.
  const settingsReady = !settings.isPending || settings.isError;
  const crop =
    crops.data && settingsReady
      ? (crops.data.find((item) => item.code === selectedCode) ??
        pickDefaultCrop(crops.data, settings.data?.defaultCropType))
      : undefined;
  const remainingToday = settings.data?.remainingToday;

  const changeCrop = (code: string) => (guest ? setLoginOpen(true) : setSelectedCode(code));

  return (
    <section aria-labelledby="home-diagnosis-title" className={cn("card-normal flex flex-col gap-5 rounded-xl p-4 sm:p-6", className)}>
      <header className="flex flex-col gap-1">
        <h2 id="home-diagnosis-title" className="flex items-center gap-2 text-lg font-semibold sm:text-xl">
          <ScanSearchIcon aria-hidden className="size-5 text-primary" />
          Chẩn đoán bệnh cây trồng
        </h2>
        <p className="text-sm text-muted-foreground">
          Chọn cây, chụp hoặc tải ảnh lên — AI nhận diện bệnh, sâu hại và gợi ý cách xử lý.
          {remainingToday != null && (
            <>
              {" "}
              Hôm nay bạn còn <span className="font-medium text-foreground">{remainingToday}</span> lượt.
            </>
          )}
        </p>
      </header>

      {crops.isError ? (
        <Callout tone="danger" role="alert" title="Không tải được danh sách cây trồng">
          <Button variant="outline" size="sm" className="mt-2" onClick={() => void crops.refetch()}>
            <RefreshCwIcon aria-hidden />
            Thử lại
          </Button>
        </Callout>
      ) : !crop ? (
        crops.data?.length === 0 ? (
          <Callout tone="neutral">Chưa có cây trồng được hỗ trợ chẩn đoán.</Callout>
        ) : (
          <div aria-busy aria-label="Đang tải form chẩn đoán" className="flex flex-col gap-4">
            <div className="h-9 w-56 animate-pulse rounded-lg bg-muted" />
            <div className="h-16 animate-pulse rounded-lg bg-muted" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              <div className="aspect-square animate-pulse rounded-lg bg-muted" />
            </div>
          </div>
        )
      ) : (
        <>
          {crops.data && crops.data.length > 1 && (
            <Tabs value={crop.code} onValueChange={changeCrop}>
              <TabsList aria-label="Cây trồng cần chẩn đoán" className="h-10!">
                {crops.data.map((item) => {
                  const Icon = cropIcon(item.code);
                  return (
                    <TabsTrigger key={item.code} value={item.code} className="h-full gap-2 px-3">
                      <Icon aria-hidden />
                      {item.nameVi}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          )}
          <DiagnosisForm key={crop.code} cropType={crop.code} plantParts={crop.plantParts} layout="inline" guest={guest} />
        </>
      )}

      {guest && (
        <LoginRequiredDialog
          open={loginOpen}
          onOpenChange={setLoginOpen}
          description="Bạn cần đăng nhập để chẩn đoán bệnh cho cây trồng khác"
        />
      )}
    </section>
  );
}
