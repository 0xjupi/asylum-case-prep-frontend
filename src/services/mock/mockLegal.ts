import type { LegalSource } from "@/types/legal";
import { getStoredDataMode } from "./dataMode";

const SAMPLE_SOURCES: LegalSource[] = [
  {
    id: "ls-1",
    category: "german_asylum_law",
    title: "Placeholder statute title",
    courtOrAuthority: null,
    date: null,
    citation: "Placeholder citation",
    sourceUrl: null,
    relevantSection: "Placeholder section reference",
    summary: "Placeholder summary text.",
  },
];

export async function mockGetLegalSources(): Promise<LegalSource[]> {
  return getStoredDataMode() === "sample" ? SAMPLE_SOURCES : [];
}
