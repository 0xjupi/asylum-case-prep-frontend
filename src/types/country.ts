import type { IsoDateString, ReliabilityRating } from "./common";

export type CountryInfoCategory =
  | "political_situation"
  | "security_situation"
  | "human_rights"
  | "regional_conflicts"
  | "treatment_of_political_opponents"
  | "relevant_groups"
  | "government_actions"
  | "recent_developments";

export interface CountryInfoItem {
  id: string;
  category: CountryInfoCategory;
  title: string;
  summary: string;
  source: string;
  publicationDate: IsoDateString | null;
  retrievedDate: IsoDateString | null;
  url: string | null;
  excerpt: string | null;
  reliability: ReliabilityRating;
  /** Where within the country this applies (e.g. "National", "Oromia
   * Region"). Defaults to "National" when not region-specific. */
  geographicScope: string;
}

export interface CountryProfile {
  countryName: string;
  items: CountryInfoItem[];
}

export const COUNTRY_INFO_CATEGORY_LABELS: Record<CountryInfoCategory, string> = {
  political_situation: "Political situation",
  security_situation: "Security situation",
  human_rights: "Human rights",
  regional_conflicts: "Regional conflicts",
  treatment_of_political_opponents: "Treatment of political opponents",
  relevant_groups: "Relevant groups",
  government_actions: "Government actions",
  recent_developments: "Recent developments",
};
