import { AppApiError, httpClient } from "@/shared/api";
import type { ApiResponse } from "@/shared/api";
import type {
  MoomentCreditSettings,
  MoomentCreditSettingsResponse,
  SaveMoomentCreditSettingsPayload,
} from "../types";
import { settingsEndpoints } from "./settings.endpoints";

const unwrapSettings = (response: ApiResponse<MoomentCreditSettingsResponse>): MoomentCreditSettings => {
  const settings = response.data?.settings;

  if (!settings) {
    throw new AppApiError(response.message || "The settings response did not include Mooment credit settings.", {
      requestId: response.requestId,
      statusCode: response.statusCode,
    });
  }

  return settings;
};

export const moomentCreditService = {
  async getSettings(): Promise<MoomentCreditSettings> {
    const response = await httpClient.get<ApiResponse<MoomentCreditSettingsResponse>>(
      settingsEndpoints.moomentCredit,
    );

    return unwrapSettings(response.data);
  },

  async saveSettings(payload: SaveMoomentCreditSettingsPayload): Promise<MoomentCreditSettings> {
    const response = await httpClient.put<ApiResponse<MoomentCreditSettingsResponse>>(
      settingsEndpoints.moomentCredit,
      payload,
    );

    return unwrapSettings(response.data);
  },
};
