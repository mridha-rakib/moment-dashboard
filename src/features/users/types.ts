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
export type CrowdStatus = "not_busy" | "busy" | "very_busy";
export type EventPrivacy = "public" | "private" | "locked";
export type EventAgeRestriction = "all_ages" | "18_plus" | "21_plus";
export type EventMediaType = "image" | "video";
export type EventTicketType = "free" | "pay";
export type EventRewardType = "ticket" | "product";

export type EventHost = {
  id: string;
  name: string;
  username?: string | null;
  avatarKey?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  followersCount?: number;
  eventsCount?: number;
};

export type EventLocation = {
  searchLabel?: string | null;
  venue?: string | null;
  address?: string | null;
  formattedAddress?: string | null;
  addressLine1?: string | null;
  neighborhood?: string | null;
  district?: string | null;
  city?: string | null;
  region?: string | null;
  regionCode?: string | null;
  postalCode?: string | null;
  country?: string | null;
  countryCode?: string | null;
  additionalInfo?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type EventTicket = {
  id: string;
  name: string;
  description?: string | null;
  type: EventTicketType;
  price: number;
  capacity: number;
  availableCount?: number | null;
  salesEndAt?: string | null;
};

export type EventReward = {
  id: string;
  rewardType: EventRewardType;
  ticketId?: string | null;
  productId?: string | null;
  targetName?: string | null;
  imageKeys?: string[];
  name: string;
  description?: string | null;
  expiresAt?: string | null;
  discountEnabled?: boolean;
  discountPercent?: number | null;
  bogoEnabled?: boolean;
  buyQuantity?: number | null;
  freeQuantity?: number | null;
  capacityLimited?: boolean;
  capacity?: number | null;
  availableCount?: number | null;
  disabledAt?: string | null;
};

export type EventMedia = {
  id: string;
  url: string;
  type: EventMediaType;
  contentType: string;
  fileSize: number;
  width?: number | null;
  height?: number | null;
  durationSeconds?: number | null;
  displayOrder: number;
  createdAt: string;
};

export type PublicGoingSummary = {
  going: number;
  avatars: string[];
};

export type EventResponse = {
  id: string;
  userId?: string;
  host?: EventHost | null;
  name?: string | null;
  description?: string | null;
  bannerImageKey?: string | null;
  bannerOriginalImageKey?: string | null;
  bannerImageUrl?: string | null;
  ageRestriction?: EventAgeRestriction | null;
  hashtags?: string[];
  scheduledAt?: string | null;
  endAt?: string | null;
  location?: EventLocation | null;
  privacy: EventPrivacy;
  status: EventStatus;
  crowdStatus?: CrowdStatus | null;
  tickets: EventTicket[];
  rewards?: EventReward[];
  eventMedia?: EventMedia[];
  categories: string[];
  category?: string | null;
  memberCount?: number;
  publicGoingSummary?: PublicGoingSummary;
  publishedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  cancellationReasonType?: string | null;
  cancellationCustomReason?: string | null;
  cancellationDisplayReason?: string | null;
  createdAt: string;
  updatedAt?: string;
};

export type ProfileEventGroups = {
  active: EventResponse[];
  past: EventResponse[];
};
