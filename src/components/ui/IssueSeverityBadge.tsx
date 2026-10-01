import type { IssueSeverity } from "@/types";
import { Badge, type BadgeTone } from "./Badge";

const SEVERITY_CONFIG: Record<IssueSeverity, { label: string; tone: BadgeTone }> = {
  critical: { label: "Critical", tone: "brick" },
  moderate: { label: "Moderate", tone: "ochre" },
  minor: { label: "Minor", tone: "slate" },
  informational: { label: "Informational", tone: "neutral" },
};

export function IssueSeverityBadge({ severity }: { severity: IssueSeverity }) {
  const config = SEVERITY_CONFIG[severity];
  return <Badge tone={config.tone}>{config.label}</Badge>;
}
