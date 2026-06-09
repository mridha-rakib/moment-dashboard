import axios from "axios";
import { appConfig } from "@/shared/config/env";
import { normalizeApiError } from "./api-error";
import { tokenManager } from "./token-manager";

type UnauthorizedHandler = () => void;
type TokenRefreshHandler = () => Promise<void>;

let unauthorizedHandler: UnauthorizedHandler | null = null;
let tokenRefreshHandler: TokenRefreshHandler | null = null;
let tokenRefreshPromise: Promise<void> | null = null;

export const setUnauthorizedHandler = (handler: UnauthorizedHandler): void => {
  unauthorizedHandler = handler;
};

export const setTokenRefreshHandler = (handler: TokenRefreshHandler): void => {
  tokenRefreshHandler = handler;
};

const refreshAuthToken = async (): Promise<void> => {
  if (!tokenRefreshHandler) {
    throw new Error("Missing token refresh handler.");
  }

  if (!tokenRefreshPromise) {
    tokenRefreshPromise = tokenRefreshHandler().finally(() => {
      tokenRefreshPromise = null;
    });
  }

  return tokenRefreshPromise;
};

export const httpClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: appConfig.apiTimeoutMs,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

httpClient.interceptors.request.use((config) => {
  if (!config.skipAuthHeader) {
    const token = tokenManager.getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const apiError = normalizeApiError(error);
    const originalRequest = axios.isAxiosError(error) ? error.config : undefined;
    const skipAuthRedirect = originalRequest?.skipAuthRedirect ?? false;
    const skipAuthRefresh = originalRequest?.skipAuthRefresh ?? false;

    if (apiError.statusCode === 401 && originalRequest && !skipAuthRefresh && !originalRequest._authRetry) {
      originalRequest._authRetry = true;

      try {
        await refreshAuthToken();
        const token = tokenManager.getAccessToken();

        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }

        return httpClient(originalRequest);
      } catch {
        // Fall through to the unauthorized handler below.
      }
    }

    if (apiError.statusCode === 401 && !skipAuthRedirect) {
      unauthorizedHandler?.();
    }

    return Promise.reject(apiError);
  },
);
