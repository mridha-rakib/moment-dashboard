export type ReportStatus = "pending" | "resolved" | "dismissed";
export type ReportTargetType = "post" | "event" | "user" | "room";
export type ReportAction = "warn" | "remove_content" | "suspend_user" | "dismiss";

export type ReportUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
};

export type AdminReport = {
  id: string;
  reporter: ReportUser;
  reportedUser: ReportUser;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  details?: string | null;
  status: ReportStatus;
  resolutionAction?: ReportAction | null;
  content: { title?: string | null; description?: string | null; imageUrl?: string | null };
  createdAt: string;
  updatedAt: string;
};

export type ReportsPagination = { page: number; limit: number; total: number; totalPages: number; from: number; to: number };
export type ReportListParams = { page: number; limit: number; search?: string; status?: ReportStatus; type?: ReportTargetType };
export type ReportListResponse = { reports: AdminReport[]; pagination: ReportsPagination };
export type ReportDetailResponse = { report: AdminReport; relatedReports: AdminReport[] };
