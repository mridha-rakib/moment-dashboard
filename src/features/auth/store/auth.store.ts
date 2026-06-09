import { create } from "zustand";
import {
  getApiErrorMessage,
  normalizeApiError,
  setTokenRefreshHandler,
  setUnauthorizedHandler,
  tokenManager,
} from "@/shared/api";
import { failedAsyncState, idleAsyncState, loadingAsyncState, type AsyncState } from "@/shared/store/async-state";
import type { AuthSession, AuthUser, ChangePasswordPayload, LoginCredentials, UpdateProfilePayload } from "../types";
import { assertAdminUser } from "../services/auth.guard";
import { authService } from "../services/auth.service";
import { authSessionStorage } from "../services/auth-session.storage";

interface AuthStore extends AsyncState {
  accessToken: string | null;
  clearAuthState: () => void;
  hasRestored: boolean;
  isAuthenticated: boolean;
  isRestoring: boolean;
  changePassword: (payload: ChangePasswordPayload) => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  logout: () => Promise<void>;
  restoreAuthSession: () => Promise<AuthUser | null>;
  setSession: (session: AuthSession) => void;
  setUser: (user: AuthUser | null) => void;
  updateProfile: (payload: UpdateProfilePayload) => Promise<AuthUser>;
  user: AuthUser | null;
}

const storedSession = authSessionStorage.getSession();

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...idleAsyncState,
  accessToken: storedSession.accessToken,
  hasRestored: false,
  isAuthenticated: storedSession.isAuthenticated,
  isRestoring: Boolean(storedSession.accessToken || storedSession.refreshToken),
  user: storedSession.user,

  login: async (credentials) => {
    set({ ...loadingAsyncState(), isRestoring: false });

    try {
      const session = await authService.loginAdmin(credentials);
      assertAdminUser(session.user);
      get().setSession(session);

      return session.user;
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to sign in. Check your credentials and try again.");
      set({ ...failedAsyncState(message), isRestoring: false });
      throw normalizeApiError(error, message);
    }
  },

  updateProfile: async (payload) => {
    set({ ...loadingAsyncState(), isRestoring: false });

    try {
      const user = await authService.updateCurrentUser(payload);
      assertAdminUser(user);
      authSessionStorage.saveUser(user);
      set({
        ...idleAsyncState,
        hasRestored: true,
        isAuthenticated: Boolean(get().accessToken),
        isRestoring: false,
        user,
      });

      return user;
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to update profile. Please try again.");
      set({ ...failedAsyncState(message), isRestoring: false });
      throw normalizeApiError(error, message);
    }
  },

  changePassword: async (payload) => {
    set({ ...loadingAsyncState(), isRestoring: false });

    try {
      await authService.changePassword(payload);
      const refreshedUser = await authService.getCurrentUser();
      assertAdminUser(refreshedUser);
      authSessionStorage.saveUser(refreshedUser);
      set({
        ...idleAsyncState,
        hasRestored: true,
        isAuthenticated: Boolean(get().accessToken),
        isRestoring: false,
        user: refreshedUser,
      });
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to update password. Please try again.");
      set({ ...failedAsyncState(message), isRestoring: false });
      throw normalizeApiError(error, message);
    }
  },

  logout: async () => {
    set(loadingAsyncState());

    try {
      if (get().accessToken) {
        await authService.logout();
      }
    } catch {
      // Always clear local auth state even if the API logout request fails.
    } finally {
      get().clearAuthState();
      set({ ...idleAsyncState, hasRestored: true, isRestoring: false });
    }
  },

  restoreAuthSession: async () => {
    const accessToken = tokenManager.getAccessToken();
    const refreshToken = tokenManager.getRefreshToken();

    if (get().hasRestored && get().accessToken === accessToken) {
      return get().user;
    }

    if (!accessToken) {
      if (refreshToken) {
        set({
          error: null,
          isAuthenticated: Boolean(authSessionStorage.getUser()),
          isRestoring: true,
          user: authSessionStorage.getUser(),
        });

        try {
          const session = await authService.refreshSession();
          assertAdminUser(session.user);
          get().setSession(session);
          return session.user;
        } catch {
          // Fall through to clearing stale local auth state below.
        }
      }

      get().clearAuthState();
      set({ hasRestored: true, isRestoring: false });
      return null;
    }

    set({
      accessToken,
      error: null,
      isAuthenticated: Boolean(authSessionStorage.getUser()),
      isRestoring: true,
      user: authSessionStorage.getUser(),
    });

    try {
      const user = await authService.getCurrentUser();
      assertAdminUser(user);
      authSessionStorage.saveUser(user);
      set({
        accessToken,
        error: null,
        hasRestored: true,
        isAuthenticated: true,
        isRestoring: false,
        user,
      });

      return user;
    } catch (error) {
      const message = getApiErrorMessage(error, "Your session expired. Please sign in again.");
      get().clearAuthState();
      set({ error: message, hasRestored: true, isRestoring: false });
      return null;
    }
  },

  setSession: (session) => {
    authSessionStorage.saveSession(session);
    set({
      ...idleAsyncState,
      accessToken: session.tokens.accessToken,
      hasRestored: true,
      isAuthenticated: true,
      isRestoring: false,
      user: session.user,
    });
  },

  setUser: (user) => {
    if (user) {
      authSessionStorage.saveUser(user);
    } else {
      authSessionStorage.clearSession();
    }

    set({
      error: null,
      isAuthenticated: Boolean(user && get().accessToken),
      user,
    });
  },

  clearAuthState: () => {
    authSessionStorage.clearSession();
    set({
      accessToken: null,
      error: null,
      isAuthenticated: false,
      user: null,
    });
  },
}));

setUnauthorizedHandler(() => {
  useAuthStore.getState().clearAuthState();

  if (typeof window !== "undefined" && window.location.pathname !== "/sign-in") {
    window.location.assign("/sign-in");
  }
});

setTokenRefreshHandler(async () => {
  const session = await authService.refreshSession();
  assertAdminUser(session.user);
  useAuthStore.getState().setSession(session);
});
