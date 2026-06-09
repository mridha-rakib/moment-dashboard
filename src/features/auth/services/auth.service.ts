import { AppApiError, httpClient, tokenManager } from "@/shared/api";
import type { ApiResponse } from "@/shared/api";
import type {
  AuthSession,
  AuthUser,
  ChangePasswordPayload,
  CurrentUserResponse,
  LoginCredentials,
  UpdateProfilePayload,
} from "../types";
import { authEndpoints } from "./auth.endpoints";

const unwrapApiData = <TData>(response: ApiResponse<TData>, fallbackMessage: string): TData => {
  if (response.data === undefined || response.data === null) {
    throw new AppApiError(response.message || fallbackMessage, {
      statusCode: response.statusCode,
      requestId: response.requestId,
    });
  }

  return response.data;
};

export const authService = {
  async loginAdmin(credentials: LoginCredentials): Promise<AuthSession> {
    const response = await httpClient.post<ApiResponse<AuthSession>>(authEndpoints.adminLogin, credentials, {
      skipAuthRedirect: true,
      skipAuthHeader: true,
      skipAuthRefresh: true,
    });

    return unwrapApiData(response.data, "The sign in response was incomplete.");
  },

  async getCurrentUser(): Promise<AuthUser> {
    const response = await httpClient.get<ApiResponse<CurrentUserResponse>>(authEndpoints.currentUser, {
      skipAuthRedirect: true,
    });
    const data = unwrapApiData(response.data, "The restored session did not include a user.");

    return data.user;
  },

  async refreshSession(): Promise<AuthSession> {
    const refreshToken = tokenManager.getRefreshToken();

    if (!refreshToken) {
      throw new AppApiError("Missing refresh token.", {
        statusCode: 401,
      });
    }

    const response = await httpClient.post<ApiResponse<AuthSession>>(
      authEndpoints.refresh,
      { refreshToken },
      {
        skipAuthHeader: true,
        skipAuthRedirect: true,
        skipAuthRefresh: true,
      },
    );

    return unwrapApiData(response.data, "The refreshed session response was incomplete.");
  },

  async updateCurrentUser(payload: UpdateProfilePayload): Promise<AuthUser> {
    const response = await httpClient.patch<ApiResponse<CurrentUserResponse>>(authEndpoints.currentUser, payload);
    const data = unwrapApiData(response.data, "The profile update response was incomplete.");

    return data.user;
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await httpClient.patch(authEndpoints.password, payload);
  },

  async logout(): Promise<void> {
    await httpClient.post(authEndpoints.logout, null, {
      skipAuthRedirect: true,
      skipAuthRefresh: true,
    });
  },
};
