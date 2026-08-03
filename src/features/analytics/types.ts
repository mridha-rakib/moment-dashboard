export type AnalyticsRangePreset = "today" | "7d" | "30d" | "custom";
export type AnalyticsBucketUnit = "hour" | "day" | "week" | "month";

export interface AnalyticsOverviewParams {
  range: AnalyticsRangePreset;
  start?: string;
  end?: string;
}

export interface AnalyticsRange {
  preset: AnalyticsRangePreset;
  start: string;
  end: string;
  comparisonStart: string;
  comparisonEnd: string;
  timezone: "UTC";
  bucket: AnalyticsBucketUnit;
}

export interface AnalyticsSummary {
  totalUsers: number;
  ticketsIssued: number;
  grossTicketSalesMinor: number;
  successfulRefundsMinor: number;
  netTicketRevenueMinor: number;
  currency: string;
}

export interface AnalyticsComparison {
  usersChangePercentage: number | null;
  ticketsChangePercentage: number | null;
  grossSalesChangePercentage: number | null;
  netRevenueChangePercentage: number | null;
}

export interface AnalyticsRevenueBucket {
  bucketStart: string;
  bucketEnd: string;
  label: string;
  grossTicketSalesMinor: number;
  successfulRefundsMinor: number;
  netTicketRevenueMinor: number;
}

export interface AnalyticsTicketDistribution {
  fullPricePaid: number;
  discounted: number;
  free: number;
  rewardedOrBonus: number;
}

export interface AnalyticsUserBucket {
  bucketStart: string;
  bucketEnd: string;
  label: string;
  newUsers: number;
}

export interface AnalyticsUserMetrics {
  newUsers: number;
  series: AnalyticsUserBucket[];
}

export interface AnalyticsOverviewResponse {
  range: AnalyticsRange;
  summary: AnalyticsSummary;
  comparison: AnalyticsComparison;
  revenueSeries: AnalyticsRevenueBucket[];
  ticketDistribution: AnalyticsTicketDistribution;
  userMetrics: AnalyticsUserMetrics;
}
