import type { ReliabilityRating } from "./common";

export type LegalSourceCategory =
  | "german_asylum_law"
  | "eu_asylum_law"
  | "german_case_law"
  | "administrative_court_decisions"
  | "bamf_public_guidance"
  /** Hessen-specific administrative/procedural information — kept
   * distinct from federal law so the UI never implies Hessen has its
   * own separate asylum law where the governing rule is actually
   * federal or EU law. */
  | "hessen_procedural"
  | "other";

export type Jurisdiction = "federal" | "eu" | "hessen";

export interface LegalSource {
  id: string;
  category: LegalSourceCategory;
  title: string;
  courtOrAuthority: string | null;
  date: string | null;
  citation: string | null;
  sourceUrl: string | null;
  relevantSection: string | null;
  summary: string | null;
  /** Which body of law this belongs to — the explicit distinction
   * between federal, EU, and Hessen-specific administrative rules. */
  jurisdiction: Jurisdiction;
  /** When this source was last confirmed to reflect current law/practice
   * — distinct from `date` (enactment/decision/publication date). */
  retrievedDate: string | null;
  /** When the cited rule actually took/takes effect, if different from
   * its publication date. */
  effectiveDate: string | null;
  reliability: ReliabilityRating;
}

export const LEGAL_SOURCE_CATEGORY_LABELS: Record<LegalSourceCategory, string> = {
  german_asylum_law: "German asylum law",
  eu_asylum_law: "EU asylum law",
  german_case_law: "German case law",
  administrative_court_decisions: "Administrative court decisions",
  bamf_public_guidance: "BAMF / public guidance",
  hessen_procedural: "Hessen procedure",
  other: "Other relevant sources",
};

export const JURISDICTION_LABELS: Record<Jurisdiction, string> = {
  federal: "Federal (Germany)",
  eu: "European Union",
  hessen: "Hessen (state administrative)",
};
