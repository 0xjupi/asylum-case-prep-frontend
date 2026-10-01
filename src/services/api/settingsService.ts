import { apiRequest, isBackendConfigured, mockDelay } from "./client";
import { mockGetSettings, mockUpdateSettings } from "@/services/mock/mockSettings";
import type { AppSettings } from "@/types";

/**
 * Backend contract:
 *   GET   /api/settings  -> AppSettings
 *   PATCH /api/settings  -> AppSettings
 * No authentication/account infrastructure is implemented here — settings
 * are scoped to whatever session or account mechanism the backend adds later.
 */
export const settingsService = {
  async get(): Promise<AppSettings> {
    if (isBackendConfigured) return apiRequest<AppSettings>("/api/settings");
    await mockDelay(200);
    return mockGetSettings();
  },

  async update(partial: Partial<AppSettings>): Promise<AppSettings> {
    if (isBackendConfigured) {
      return apiRequest<AppSettings>("/api/settings", { method: "PATCH", body: JSON.stringify(partial) });
    }
    await mockDelay(200);
    return mockUpdateSettings(partial);
  },
};
