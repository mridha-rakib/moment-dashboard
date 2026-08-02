import type { EventCategory } from "@/shared/eventCategories";

export type AdminMapEventStatus = "upcoming" | "live" | "active";
export type CrowdStatus = "not_busy" | "busy" | "very_busy";

export interface AdminMapEvent {
  id: string;
  title: string;
  status: AdminMapEventStatus;
  crowdStatus?: CrowdStatus | null;
  scheduledAt?: string | null;
  endAt?: string | null;
  latitude: number;
  longitude: number;
  locationName: string;
  category?: EventCategory | null;
  categories: EventCategory[];
  bannerImageUrl?: string | null;
  hostName?: string | null;
}

export type DashboardRangePreset = "today" | "7d" | "30d" | "custom";

export interface DashboardOverviewParams {
  range: DashboardRangePreset;
  start?: string;
  end?: string;
}

export interface DashboardOverviewRange {
  preset: DashboardRangePreset;
  start: string;
  end: string;
  comparisonStart: string;
  comparisonEnd: string;
  timezone: "UTC";
}

export interface DashboardOverviewUsers {
  total: number;
  newInPeriod: number;
  newInPeriodChangePercentage: number | null;
}

export interface DashboardOverviewTickets {
  issued: number;
  issuedChangePercentage: number | null;
  paid: number;
  discounted: number;
  free: number;
  rewardedOrBonus: number;
  checkedIn: number;
  userCancelled: number;
}

export interface DashboardOverviewFinancials {
  currency: string;
  grossTicketSalesMinor: number;
  grossTicketSalesChangePercentage: number | null;
  userTicketRefundsMinor: number;
  userTicketRefundCount: number;
  hostEventCancellationRefundsMinor: number;
  hostEventCancellationRefundCount: number;
  totalSuccessfulRefundsMinor: number;
  totalSuccessfulRefundCount: number;
  currentPendingRefundsMinor: number;
  currentPendingRefundCount: number;
  currentFailedRefundsMinor: number;
  currentFailedRefundCount: number;
  currentReconciliationRequiredRefundsMinor: number;
  currentReconciliationRequiredRefundCount: number;
  netTicketRevenueMinor: number;
  netTicketRevenueChangePercentage: number | null;
}

export interface DashboardOverviewResponse {
  range: DashboardOverviewRange;
  users: DashboardOverviewUsers;
  tickets: DashboardOverviewTickets;
  financials: DashboardOverviewFinancials;
}
