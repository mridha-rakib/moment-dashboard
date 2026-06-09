import { AppApiError, httpClient } from "@/shared/api";
import type { ApiResponse } from "@/shared/api";
import type {
  PricingSettings,
  PricingSettingsResponse,
  SavePricingSettingsPayload,
} from "../types";
import { settingsEndpoints } from "./settings.endpoints";

const unwrapSettings = (response: ApiResponse<PricingSettingsResponse>): PricingSettings => {
  const settings = response.data?.settings;

  if (!settings) {
    throw new AppApiError(response.message || "The settings response did not include pricing settings.", {
      requestId: response.requestId,
      statusCode: response.statusCode,
    });
  }

  return settings;
};

export const pricingSettingsService = {
  async getSettings(): Promise<PricingSettings> {
    const response = await httpClient.get<ApiResponse<PricingSettingsResponse>>(settingsEndpoints.pricing);

    return unwrapSettings(response.data);
  },

  async saveSettings(payload: SavePricingSettingsPayload): Promise<PricingSettings> {
    const response = await httpClient.put<ApiResponse<PricingSettingsResponse>>(
      settingsEndpoints.pricing,
      payload,
    );

    return unwrapSettings(response.data);
  },
};
