import { browserStorage } from "@/shared/storage/browser-storage";

const ACCESS_TOKEN_KEY = "xenog.admin.accessToken";
const REFRESH_TOKEN_KEY = "xenog.admin.refreshToken";

export const tokenManager = {
  getAccessToken(): string | null {
    return browserStorage.getString(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    return browserStorage.getString(REFRESH_TOKEN_KEY);
  },

  setAccessToken(accessToken: string): void {
    browserStorage.setString(ACCESS_TOKEN_KEY, accessToken);
  },

  setRefreshToken(refreshToken: string): void {
    browserStorage.setString(REFRESH_TOKEN_KEY, refreshToken);
  },

  setTokens(tokens: { accessToken: string; refreshToken: string }): void {
    this.setAccessToken(tokens.accessToken);
    this.setRefreshToken(tokens.refreshToken);
  },

  clearAccessToken(): void {
    browserStorage.remove(ACCESS_TOKEN_KEY);
  },

  clearRefreshToken(): void {
    browserStorage.remove(REFRESH_TOKEN_KEY);
  },

  clearTokens(): void {
    this.clearAccessToken();
    this.clearRefreshToken();
  },
};
