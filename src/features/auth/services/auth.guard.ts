import { AppApiError } from "@/shared/api";
import type { AuthUser } from "../types";

export const assertAdminUser = (user: AuthUser): void => {
  if (user.role !== "admin") {
    throw new AppApiError("You do not have permission to access this portal.", {
      statusCode: 403,
    });
  }
};
