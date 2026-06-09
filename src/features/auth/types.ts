export type UserRole = "user" | "admin";
export type AccountType = "personal" | "business";

export interface AuthUser {
  id: string;
  name: string;
  username?: string;
  email: string;
  contact?: string | null;
  passwordChangedAt?: string | null;
  accountType: AccountType;
  avatarKey?: string | null;
  gender?: string | null;
  age?: number | null;
  bio?: string | null;
  address?: string | null;
  businessDocumentKey?: string | null;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  contact?: string | null;
  avatarKey?: string | null;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
}

export interface AuthSession {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface CurrentUserResponse {
  user: AuthUser;
}
