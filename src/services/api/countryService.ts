import { apiRequest, isBackendConfigured, mockDelay } from "./client";
import { mockGetCountryProfile } from "@/services/mock/mockCountry";
import type { ApiResult, CountryProfile } from "@/types";

/** Backend contract: GET /api/country/{countryName} -> CountryProfile */
export const countryService = {
  async getProfile(countryName = "ethiopia"): Promise<ApiResult<CountryProfile>> {
    if (isBackendConfigured) {
      const data = await apiRequest<CountryProfile>(`/api/country/${countryName}`);
      return { data, isMock: false, fetchedAt: new Date().toISOString() };
    }
    await mockDelay();
    const data = await mockGetCountryProfile();
    return { data, isMock: true, fetchedAt: new Date().toISOString() };
  },
};
