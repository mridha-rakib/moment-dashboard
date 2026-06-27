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
  isDeleted: boolean;
  totalEvents: number;
  completedEvents: number;
  cancelledEvents: number;
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
  accountType?: UserAccountType;
};

export type UserListResponse = {
  users: ManagedUser[];
  pagination: UsersPagination;
  stats: UserManagementStats;
};

export type UserManagementStats = {
  total: number;
  active: number;
  suspended: number;
  business: number;
};

export type UpdateUserPayload = Partial<Pick<ManagedUser, "isActive" | "emailVerified">>;

export type EventStatus = "draft" | "published" | "live" | "completed" | "cancelled";
export type EventPrivacy = "public" | "private" | "locked";

export type EventLocation = {
  searchLabel?: string | null;
  venue?: string | null;
  address?: string | null;
  additionalInfo?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type EventTicket = {
  id: string;
  name: string;
  description?: string | null;
  type: "free" | "pay";
  price: number;
  capacity: number;
  salesEndAt?: string | null;
};

export type EventResponse = {
  id: string;
  name?: string | null;
  description?: string | null;
  bannerImageKey?: string | null;
  bannerImageUrl?: string | null;
  scheduledAt?: string | null;
  endAt?: string | null;
  location?: EventLocation | null;
  privacy: EventPrivacy;
  status: EventStatus;
  tickets: EventTicket[];
  categories: string[];
  publishedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
};

export type ProfileEventGroups = {
  active: EventResponse[];
  past: EventResponse[];
};
