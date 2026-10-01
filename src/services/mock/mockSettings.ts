import type { AppSettings } from "@/types/settings";

const DEFAULT_SETTINGS: AppSettings = {
  casePreferences: {
    caseDisplayName: null,
    preferredLanguage: "en",
    defaultCountryFocus: "Ethiopia",
  },
  aiBehaviorPreferences: {
    bamfDifficulty: "standard",
    showObservationsDuringHearing: true,
    autoDetectIssues: true,
  },
  interfacePreferences: {
    fontSize: "standard",
    transcriptDensity: "comfortable",
  },
};

let currentSettings: AppSettings = DEFAULT_SETTINGS;

export async function mockGetSettings(): Promise<AppSettings> {
  return currentSettings;
}

export async function mockUpdateSettings(partial: Partial<AppSettings>): Promise<AppSettings> {
  currentSettings = { ...currentSettings, ...partial };
  return currentSettings;
}
