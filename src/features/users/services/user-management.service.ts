import { AppApiError, httpClient } from "@/shared/api";
import type { ApiResponse } from "@/shared/api";
import type { ManagedUser, ProfileEventGroups, UpdateUserPayload, UserListParams, UserListResponse, UserManagementStats, UsersPagination } from "../types";
import { userManagementEndpoints } from "./user-management.endpoints";

type UsersMeta = Partial<UsersPagination> & {
  pagination?: Partial<UsersPagination>;
  stats?: Partial<UserManagementStats>;
};

const normalizeUser = (user: ManagedUser): ManagedUser => ({
  ...user,
  accountType: user.accountType ?? "personal",
  isActive: Boolean(user.isActive),
  emailVerified: Boolean(user.emailVerified),
  isDeleted: Boolean(user.isDeleted),
  totalEvents: Number(user.totalEvents) || 0,
  completedEvents: Number(user.completedEvents) || 0,
  cancelledEvents: Number(user.cancelledEvents) || 0,
});

const normalizePagination = (
  params: UserListParams,
  total: number,
  meta?: UsersMeta,
): UsersPagination => {
  const rawPagination = meta?.pagination ?? meta ?? {};
  const page = Number(rawPagination.page ?? params.page);
  const limit = Number(rawPagination.limit ?? params.limit);
  const safePage = Number.isFinite(page) && page > 0 ? page : params.page;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : params.limit;
  const safeTotal = Number(rawPagination.total ?? total) || 0;
  const totalPages = Number(rawPagination.totalPages ?? Math.ceil(safeTotal / safeLimit)) || 0;

  return {
    page: safePage,
    limit: safeLimit,
    total: safeTotal,
    totalPages,
    from: safeTotal === 0 ? 0 : (safePage - 1) * safeLimit + 1,
    to: safeTotal === 0 ? 0 : Math.min(safePage * safeLimit, safeTotal),
  };
};

const unwrapUsers = (response: ApiResponse<ManagedUser[]>, params: UserListParams): UserListResponse => {
  if (!Array.isArray(response.data)) {
    throw new AppApiError(response.message || "The users response did not include a user list.", {
      requestId: response.requestId,
      statusCode: response.statusCode,
    });
  }

  const meta = response.meta as UsersMeta | undefined;
  const stats = meta?.stats;

  return {
    users: response.data.map(normalizeUser),
    pagination: normalizePagination(params, response.data.length, meta),
    stats: {
      total: Number(stats?.total) || 0,
      active: Number(stats?.active) || 0,
      suspended: Number(stats?.suspended) || 0,
      business: Number(stats?.business) || 0,
    },
  };
};

const unwrapUser = (response: ApiResponse<ManagedUser>): ManagedUser => {
  if (!response.data?.id) {
    throw new AppApiError(response.message || "The user response did not include a user.", {
      requestId: response.requestId,
      statusCode: response.statusCode,
    });
  }

  return normalizeUser(response.data);
};

export const userManagementService = {
  async listUsers(params: UserListParams): Promise<UserListResponse> {
    const response = await httpClient.get<ApiResponse<ManagedUser[]>>(userManagementEndpoints.users, {
      params,
    });

    return unwrapUsers(response.data, params);
  },

  async getUser(id: string): Promise<ManagedUser> {
    const response = await httpClient.get<ApiResponse<ManagedUser>>(userManagementEndpoints.user(id));

    return unwrapUser(response.data);
  },

  async updateUser(id: string, payload: UpdateUserPayload): Promise<ManagedUser> {
    const response = await httpClient.patch<ApiResponse<ManagedUser>>(userManagementEndpoints.user(id), payload);

    return unwrapUser(response.data);
  },

  async deleteUser(id: string): Promise<void> {
    await httpClient.delete(userManagementEndpoints.user(id));
  },

  async getUserEvents(id: string): Promise<ProfileEventGroups> {
    const response = await httpClient.get<ApiResponse<{ events: ProfileEventGroups }>>(
      userManagementEndpoints.userEvents(id),
    );

    const data = response.data?.data;
    if (!data?.events) {
      throw new AppApiError(response.data?.message || "Failed to retrieve user events.", {
        requestId: response.data?.requestId,
        statusCode: response.data?.statusCode,
      });
    }

    return data.events;
  },
};
