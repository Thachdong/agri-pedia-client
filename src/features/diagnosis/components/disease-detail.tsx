"use client";

import { ArrowRightIcon, ExternalLinkIcon } from "lucide-react";
import Link from "next/link";
import { Badge, Button } from "@/shared/components/atoms";
import { Callout, InfoTable } from "@/shared/components/molecules";
import { ROUTES } from "@/shared/constants";
import { cn } from "@/shared/lib/utils";
import {
  AGENT_TYPE_LABELS,
  CATEGORY_LABELS,
} from "../constants/diagnosis.constants";
import { useCropLabels } from "../hooks/use-crop-labels";
import type { TDisease } from "../types/knowledge.types";

export type TDiseaseArticleProps = {
  disease: TDisease;
  /** Cây đang xem (từ kết quả chẩn đoán) — nhãn bộ phận / giai đoạn theo cây; không có → nhãn chung. */
  cropType?: string;
  /** Phần tử tiêu đề — mặc định h1; dialog: DialogTitle. */
  titleAs?: React.ElementType;
  className?: string;
};

/** Nội dung đầy đủ của 1 bệnh — dialog báo cáo bệnh ở trang kết quả chẩn đoán; có bài viết → link "Đọc bài viết đầy đủ". */
export function DiseaseArticle({ disease, cropType, titleAs: Title = "h1", className }: TDiseaseArticleProps) {
  const { partLabel, stageLabel } = useCropLabels(cropType);
  const subtitle = [disease.nameEn, disease.scientificName].filter(Boolean);
  const { cultural, biological, nutrition } = disease.treatments;
  const hasTreatments = cultural.length + biological.length + nutrition.length > 0;

  return (
    <article className={cn("flex flex-col gap-8", className)}>
      <header className="flex flex-col gap-3">
        {disease.verification !== "SOURCED" && (
          <Callout tone="warning">Thông tin chưa được chuyên gia xác nhận.</Callout>
        )}
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <Title className="text-2xl font-bold">{disease.nameVi}</Title>
            <Badge>{CATEGORY_LABELS[disease.category]}</Badge>
          </div>
          {subtitle.length > 0 && (
            <p className="text-muted-foreground">
              {disease.nameEn}
              {disease.nameEn && disease.scientificName && " · "}
              {disease.scientificName && <i>{disease.scientificName}</i>}
            </p>
          )}
        </div>
        {disease.article && (
          <Button asChild variant="outline" size="sm" className="self-start">
            <Link href={disease.article.path}>
              Đọc bài viết đầy đủ
              <ArrowRightIcon aria-hidden />
            </Link>
          </Button>
        )}
        <InfoTable
          items={[
            { label: "Tên khác", value: disease.aliases.join(", ") },
            { label: "Nhóm", value: CATEGORY_LABELS[disease.category] },
            { label: "Tác nhân", value: AGENT_TYPE_LABELS[disease.agentType] },
            { label: "Bộ phận bị hại", value: disease.affectedParts.map(partLabel).join(", ") },
            { label: "Giai đoạn", value: disease.cropStages.map(stageLabel).join(", ") },
          ]}
        />
      </header>

      <ListSection title="Tác nhân gây bệnh" items={disease.pathogens} />
      <ListSection title="Triệu chứng" items={disease.symptoms} />

      {disease.variants.length > 0 && (
        <Section title="Các dạng bệnh">
          <ul className="grid gap-3 sm:grid-cols-2">
            {disease.variants.map((variant) => (
              <li key={variant.code} className="card-normal flex flex-col gap-2 rounded-lg p-4">
                <h3 className="font-semibold">{variant.name}</h3>
                {variant.affectedParts && (
                  <p className="text-sm text-muted-foreground">Bộ phận: {variant.affectedParts}</p>
                )}
                <BulletList items={variant.symptoms} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {disease.transmissionMode && (
        <Section title="Cách lây lan">
          <p className="leading-relaxed">{disease.transmissionMode}</p>
        </Section>
      )}
      <ListSection title="Điều kiện phát sinh" items={disease.favorableConditions} />

      {hasTreatments && (
        <Section title="Biện pháp phòng trừ">
          <div className="flex flex-col gap-4">
            <SubList title="Canh tác" items={cultural} />
            <SubList title="Sinh học" items={biological} />
            <SubList title="Dinh dưỡng" items={nutrition} />
          </div>
        </Section>
      )}

      {disease.similarDiseases.length > 0 && (
        <Section title="Bệnh dễ nhầm">
          <ul className="flex flex-col divide-y divide-border-subtle rounded-lg border border-border-subtle">
            {disease.similarDiseases.map((similar) => (
              <li key={similar.code} className="flex flex-col gap-1 px-4 py-3">
                <Link
                  href={ROUTES.disease(similar.code)}
                  className="inline-flex items-center gap-1 self-start rounded-sm font-medium text-highlight underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {similar.name}
                  <ArrowRightIcon className="size-4" aria-hidden />
                </Link>
                {similar.distinguishingFeature && (
                  <p className="text-sm text-muted-foreground">Phân biệt: {similar.distinguishingFeature}</p>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {disease.references.length > 0 && (
        <Section title="Nguồn tham khảo">
          <ul className="flex flex-col gap-1.5 text-sm">
            {disease.references.map((reference) => (
              <li key={reference.url}>
                <a
                  href={reference.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-1 rounded-sm text-highlight underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {reference.title}
                  <ExternalLinkIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                  <span className="sr-only"> (mở tab mới)</span>
                </a>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5 leading-relaxed">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/** Mục dạng danh sách — rỗng thì ẩn cả mục. */
function ListSection({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <Section title={title}>
      <BulletList items={items} />
    </Section>
  );
}

function SubList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="font-medium">{title}</h3>
      <BulletList items={items} />
    </div>
  );
}
