import type { CountryProfile } from "@/types/country";
import { getStoredDataMode } from "./dataMode";

const EMPTY_PROFILE: CountryProfile = {
  countryName: "Ethiopia",
  items: [],
};

const SAMPLE_PROFILE: CountryProfile = {
  countryName: "Ethiopia",
  items: [
    {
      id: "ci-1",
      category: "political_situation",
      title: "Placeholder entry title",
      summary: "Placeholder summary text showing where sourced country-condition information will appear.",
      source: "Placeholder source organization",
      publicationDate: "2026-05-01",
      retrievedDate: "2026-08-01",
      url: null,
      excerpt: "Placeholder excerpt text.",
      reliability: "unrated",
    },
  ],
};

export async function mockGetCountryProfile(): Promise<CountryProfile> {
  return getStoredDataMode() === "sample" ? SAMPLE_PROFILE : EMPTY_PROFILE;
}
