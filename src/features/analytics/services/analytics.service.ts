import { AppApiError, httpClient } from "@/shared/api";
import type { ApiResponse } from "@/shared/api";
import type { AnalyticsOverviewParams, AnalyticsOverviewResponse } from "../types";
import { analyticsEndpoints } from "./analytics.endpoints";

export const analyticsService = {
  async getOverview(
    params: AnalyticsOverviewParams,
    signal?: AbortSignal,
  ): Promise<AnalyticsOverviewResponse> {
    const response = await httpClient.get<ApiResponse<AnalyticsOverviewResponse>>(analyticsEndpoints.overview, {
      params,
      signal,
    });
    const overview = response.data.data;

    if (!overview) {
      throw new AppApiError(response.data.message || "The analytics overview response was empty.", {
        requestId: response.data.requestId,
        statusCode: response.data.statusCode,
      });
    }

    return overview;
  },
};
