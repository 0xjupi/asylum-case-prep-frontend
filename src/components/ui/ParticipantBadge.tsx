import { Gavel, Scale, ShieldQuestion } from "lucide-react";
import type { AiParticipant } from "@/types";
import { Badge, type BadgeTone } from "./Badge";

const PARTICIPANT_CONFIG: Record<AiParticipant, { label: string; tone: BadgeTone; icon: typeof Gavel }> = {
  bamf: { label: "BAMF simulation", tone: "brick", icon: ShieldQuestion },
  lawyer: { label: "Lawyer simulation", tone: "accent", icon: Scale },
  judge: { label: "Judge simulation", tone: "slate", icon: Gavel },
};

/** Every AI participant must always be labelled this way — never as an
 * unqualified "BAMF officer", "Judge", or "Lawyer" — so it reads
 * unambiguously as a simulation. */
export function ParticipantBadge({ participant }: { participant: AiParticipant }) {
  const config = PARTICIPANT_CONFIG[participant];
  const Icon = config.icon;
  return (
    <Badge tone={config.tone}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {config.label}
    </Badge>
  );
}

export { PARTICIPANT_CONFIG };
