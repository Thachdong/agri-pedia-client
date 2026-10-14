import { CircleAlertIcon, CircleCheckIcon, Loader2Icon } from "lucide-react";
import { Badge, type TBadgeProps, type TBadgeTone } from "@/shared/components/atoms";
import { DIAGNOSIS_STATUS_LABELS } from "../constants/diagnosis.constants";
import type { TDiagnosisStatus } from "../types/diagnosis.types";

const STATUS_TONES: Record<TDiagnosisStatus, TBadgeTone> = {
  PROCESSING: "info",
  COMPLETED: "success",
  FAILED: "danger",
};

const STATUS_ICONS = {
  PROCESSING: <Loader2Icon aria-hidden className="animate-spin" />,
  COMPLETED: <CircleCheckIcon aria-hidden />,
  FAILED: <CircleAlertIcon aria-hidden />,
} satisfies Record<TDiagnosisStatus, React.ReactNode>;

export type TDiagnosisStatusBadgeProps = Omit<TBadgeProps, "tone" | "children"> & { status: TDiagnosisStatus };

export function DiagnosisStatusBadge({ status, ...props }: TDiagnosisStatusBadgeProps) {
  return (
    <Badge tone={STATUS_TONES[status]} {...props}>
      {STATUS_ICONS[status]}
      {DIAGNOSIS_STATUS_LABELS[status]}
    </Badge>
  );
}
