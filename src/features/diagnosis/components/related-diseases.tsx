"use client";

import { useDisease } from "../hooks/use-disease";
import type { TDiagnosis } from "../types/diagnosis.types";
import { DiseaseCard, DiseaseCardSkeleton } from "./disease-card";

/** Mã bệnh duy nhất từ mọi ảnh, giữ thứ tự xuất hiện. */
export const collectDiseaseCodes = (images: TDiagnosis["images"]) => [
  ...new Set(images.flatMap((image) => image.diseases.map((disease) => disease.diseaseCode))),
];

export type TRelatedDiseasesProps = { codes: string[]; className?: string };

/** Bài viết của các bệnh phát hiện — mỗi mã 1 request song song (cache theo mã); mã lỗi thì bỏ qua thẻ đó. */
export function RelatedDiseases({ codes, className }: TRelatedDiseasesProps) {
  if (codes.length === 0) return null;
  return (
    <section aria-labelledby="related-diseases-title" className={className}>
      <h2 id="related-diseases-title" className="mb-3 text-lg font-semibold">
        Bài viết liên quan
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {codes.map((code) => (
          <RelatedDisease key={code} code={code} />
        ))}
      </ul>
    </section>
  );
}

function RelatedDisease({ code }: { code: string }) {
  const { data, isPending, isError } = useDisease(code);
  if (isError) return null;
  return <li className="flex">{isPending ? <DiseaseCardSkeleton className="flex-1" /> : <DiseaseCard disease={data} className="flex-1" />}</li>;
}
