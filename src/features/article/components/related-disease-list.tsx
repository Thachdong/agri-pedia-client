import { cn } from "@/shared/lib/utils";
import type { TRelatedDisease } from "../types/article.types";
import { DiseaseCard } from "./disease-card";

export type TRelatedDiseaseListProps = {
  diseases: TRelatedDisease[];
  className?: string;
};

/** "Bệnh dễ nhầm / liên quan" cuối bài — lưới thẻ; không có bệnh nào → không render. */
export function RelatedDiseaseList({ diseases, className }: TRelatedDiseaseListProps) {
  if (diseases.length === 0) return null;

  return (
    <section aria-labelledby="related-diseases" className={cn("flex flex-col gap-3", className)}>
      <h2 id="related-diseases" className="text-lg font-semibold">
        Bệnh dễ nhầm / liên quan
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {diseases.map((disease) => (
          <li key={disease.code}>
            <DiseaseCard disease={disease} className="h-full" />
          </li>
        ))}
      </ul>
    </section>
  );
}
