import { AppApiError, httpClient } from "@/shared/api";
import type { ApiResponse } from "@/shared/api";
import type { AdminMapEvent } from "../types";
import { dashboardEndpoints } from "./dashboard.endpoints";

type MapEventsPayload = { events?: AdminMapEvent[] };

const hasValidCoordinates = (event: AdminMapEvent): boolean =>
  Number.isFinite(event.latitude) &&
  event.latitude >= -90 &&
  event.latitude <= 90 &&
  Number.isFinite(event.longitude) &&
  event.longitude >= -180 &&
  event.longitude <= 180;

export const dashboardService = {
  async listMapEvents(): Promise<AdminMapEvent[]> {
    const response = await httpClient.get<ApiResponse<MapEventsPayload>>(dashboardEndpoints.mapEvents);
    const events = response.data.data?.events;

    if (!Array.isArray(events)) {
      throw new AppApiError(response.data.message || "The map response did not include events.", {
        requestId: response.data.requestId,
        statusCode: response.data.statusCode,
      });
    }

    return events.filter(hasValidCoordinates);
  },
};
