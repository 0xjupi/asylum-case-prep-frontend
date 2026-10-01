import type { IsoDateString, PreparationStage } from "./common";

export interface PersonalInformation {
  fullName: string | null;
  nationality: string | null;
  countryOfOrigin: string | null;
  dateOfBirth: IsoDateString | null;
  caseReferenceNumber: string | null;
  bamfFileNumber: string | null;
  dateOfEntry: IsoDateString | null;
  dateOfApplication: IsoDateString | null;
  currentAddress: string | null;
  languagesSpoken: string[];
}

export interface TimelineEvent {
  id: string;
  date: IsoDateString | null;
  approximateDate: string | null; // for events without an exact date
  title: string;
  description: string | null;
  location: string | null;
  supportingEvidenceIds: string[];
}

export interface ClaimOverview {
  mainFactualEvents: string | null;
  reasonsForLeaving: string | null;
  relevantCircumstances: string | null;
  currentConcerns: string | null;
}

export interface CaseSummary {
  personalInformation: PersonalInformation;
  timeline: TimelineEvent[];
  claimOverview: ClaimOverview;
  preparationStage: PreparationStage;
  lastUpdated: IsoDateString | null;
}

export interface CaseStatusSnapshot {
  preparationStage: PreparationStage;
  transcriptUploaded: boolean;
  documentCount: number;
  openIssueCount: number;
  resolvedIssueCount: number;
  mockHearingCount: number;
  lastSessionDate: IsoDateString | null;
  lastSessionType: string | null;
}
