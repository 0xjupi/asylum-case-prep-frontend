export interface CasePreferences {
  caseDisplayName: string | null;
  preferredLanguage: string;
  defaultCountryFocus: string | null;
}

export interface AiBehaviorPreferences {
  bamfDifficulty: "standard" | "rigorous";
  showObservationsDuringHearing: boolean;
  autoDetectIssues: boolean;
}

export interface InterfacePreferences {
  fontSize: "standard" | "large";
  transcriptDensity: "comfortable" | "compact";
}

export interface AppSettings {
  casePreferences: CasePreferences;
  aiBehaviorPreferences: AiBehaviorPreferences;
  interfacePreferences: InterfacePreferences;
}
