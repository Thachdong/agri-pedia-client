import { AGENT_TYPE_LABELS, CATEGORY_LABELS, PLANT_PART_LABELS } from "@/features/diagnosis";
import { InfoTable } from "@/shared/components/molecules";
import { cn } from "@/shared/lib/utils";
import type { TArticleDisease } from "../types/article.types";

export type TArticleDiseaseInfoProps = {
  disease: TArticleDisease;
  className?: string;
};

/** Thẻ thông tin bệnh đầu bài: tên khoa học, tên tiếng Anh, nhóm, tác nhân, bộ phận bị hại, tên khác. */
export function ArticleDiseaseInfo({ disease, className }: TArticleDiseaseInfoProps) {
  return (
    <section aria-labelledby="article-disease-info" className={cn("flex flex-col gap-2", className)}>
      <h2 id="article-disease-info" className="sr-only">
        Thông tin bệnh
      </h2>
      <InfoTable
        items={[
          { label: "Tên khoa học", value: disease.scientificName && <i>{disease.scientificName}</i> },
          { label: "Tên tiếng Anh", value: disease.nameEn },
          { label: "Nhóm", value: CATEGORY_LABELS[disease.category] },
          { label: "Tác nhân", value: AGENT_TYPE_LABELS[disease.agentType] },
          { label: "Bộ phận bị hại", value: disease.affectedParts.map((part) => PLANT_PART_LABELS[part]).join(", ") },
          { label: "Tên khác", value: disease.aliases.join(", ") },
        ]}
      />
    </section>
  );
}
