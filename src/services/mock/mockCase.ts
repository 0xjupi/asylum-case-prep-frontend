import type { CaseStatusSnapshot, CaseSummary } from "@/types/case";
import { getStoredDataMode } from "./dataMode";

const EMPTY_CASE: CaseSummary = {
  personalInformation: {
    fullName: null,
    nationality: null,
    countryOfOrigin: null,
    dateOfBirth: null,
    caseReferenceNumber: null,
    bamfFileNumber: null,
    dateOfEntry: null,
    dateOfApplication: null,
    currentAddress: null,
    languagesSpoken: [],
  },
  timeline: [],
  claimOverview: {
    mainFactualEvents: null,
    reasonsForLeaving: null,
    relevantCircumstances: null,
    currentConcerns: null,
  },
  preparationStage: "not_started",
  lastUpdated: null,
};

// Sample mode uses only structural placeholders — never a specific
// invented persecution narrative — so a developer can preview populated
// layout without any fabricated case content.
const SAMPLE_CASE: CaseSummary = {
  personalInformation: {
    fullName: "Sample Applicant",
    nationality: "Sample nationality",
    countryOfOrigin: "Ethiopia",
    dateOfBirth: "1994-01-01",
    caseReferenceNumber: "SAMPLE-0001",
    bamfFileNumber: "SAMPLE-BAMF-0001",
    dateOfEntry: "2025-06-01",
    dateOfApplication: "2025-06-10",
    currentAddress: "Sample address on file",
    languagesSpoken: ["Sample language"],
  },
  timeline: [
    {
      id: "evt-1",
      date: "2025-01-15",
      approximateDate: null,
      title: "Sample timeline entry",
      description: "Placeholder text showing where a case event description will appear.",
      location: "Sample location",
      supportingEvidenceIds: [],
    },
    {
      id: "evt-2",
      date: null,
      approximateDate: "Sample approximate date",
      title: "Sample timeline entry without an exact date",
      description: "Placeholder text for events where only an approximate date is known.",
      location: null,
      supportingEvidenceIds: [],
    },
  ],
  claimOverview: {
    mainFactualEvents: "Placeholder text — this section will summarize the applicant's main factual account once entered.",
    reasonsForLeaving: "Placeholder text — reasons for leaving will appear here.",
    relevantCircumstances: "Placeholder text — relevant circumstances will appear here.",
    currentConcerns: "Placeholder text — current concerns will appear here.",
  },
  preparationStage: "gathering_information",
  lastUpdated: "2026-08-20",
};

export async function mockGetCaseSummary(): Promise<CaseSummary> {
  return getStoredDataMode() === "sample" ? SAMPLE_CASE : EMPTY_CASE;
}

export async function mockGetCaseStatus(): Promise<CaseStatusSnapshot> {
  if (getStoredDataMode() !== "sample") {
    return {
      preparationStage: "not_started",
      transcriptUploaded: false,
      documentCount: 0,
      openIssueCount: 0,
      resolvedIssueCount: 0,
      mockHearingCount: 0,
      lastSessionDate: null,
      lastSessionType: null,
    };
  }
  return {
    preparationStage: "gathering_information",
    transcriptUploaded: true,
    documentCount: 4,
    openIssueCount: 3,
    resolvedIssueCount: 1,
    mockHearingCount: 2,
    lastSessionDate: "2026-08-28",
    lastSessionType: "bamf_simulation",
  };
}

export async function mockUpdateCaseSummary(partial: Partial<CaseSummary>): Promise<CaseSummary> {
  return { ...EMPTY_CASE, ...partial, lastUpdated: new Date().toISOString() };
}
