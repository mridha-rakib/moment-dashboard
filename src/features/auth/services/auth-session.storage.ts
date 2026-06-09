import { tokenManager } from "@/shared/api";
import { browserStorage } from "@/shared/storage/browser-storage";
import type { AuthSession, AuthUser } from "../types";

const AUTH_USER_KEY = "xenog.admin.user";

export interface StoredAuthSession {
  accessToken: string | null;
  isAuthenticated: boolean;
  refreshToken: string | null;
  user: AuthUser | null;
}

export const authSessionStorage = {
  getUser(): AuthUser | null {
    return browserStorage.getJson<AuthUser>(AUTH_USER_KEY);
  },

  getSession(): StoredAuthSession {
    const accessToken = tokenManager.getAccessToken();
    const refreshToken = tokenManager.getRefreshToken();
    const user = this.getUser();

    return {
      accessToken,
      refreshToken,
      user,
      isAuthenticated: Boolean(accessToken && user),
    };
  },

  saveSession(session: AuthSession): void {
    tokenManager.setTokens(session.tokens);
    browserStorage.setJson(AUTH_USER_KEY, session.user);
  },

  saveUser(user: AuthUser): void {
    browserStorage.setJson(AUTH_USER_KEY, user);
  },

  clearSession(): void {
    tokenManager.clearTokens();
    browserStorage.remove(AUTH_USER_KEY);
  },
};
