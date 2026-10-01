import type { IsoDateString } from "./common";

export type LegalSourceCategory =
  | "german_asylum_law"
  | "eu_asylum_law"
  | "german_case_law"
  | "administrative_court_decisions"
  | "bamf_public_guidance"
  | "other";

export interface LegalSource {
  id: string;
  category: LegalSourceCategory;
  title: string;
  courtOrAuthority: string | null;
  date: IsoDateString | null;
  citation: string | null;
  sourceUrl: string | null;
  relevantSection: string | null;
  summary: string | null;
}

export const LEGAL_SOURCE_CATEGORY_LABELS: Record<LegalSourceCategory, string> = {
  german_asylum_law: "German asylum law",
  eu_asylum_law: "EU asylum law",
  german_case_law: "German case law",
  administrative_court_decisions: "Administrative court decisions",
  bamf_public_guidance: "BAMF / public guidance",
  other: "Other relevant sources",
};
