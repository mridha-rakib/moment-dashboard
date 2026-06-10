export type UserAccountType = "personal" | "business";
export type UserRole = "user" | "admin";

export type ManagedUser = {
  id: string;
  name: string;
  username?: string;
  email: string;
  contact?: string | null;
  accountType: UserAccountType;
  avatarKey?: string | null;
  avatarUrl?: string | null;
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
};

export type UsersPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  from: number;
  to: number;
};

export type UserListParams = {
  page: number;
  limit: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
};

export type UserListResponse = {
  users: ManagedUser[];
  pagination: UsersPagination;
};

export type UpdateUserPayload = Partial<Pick<ManagedUser, "isActive" | "emailVerified">>;
