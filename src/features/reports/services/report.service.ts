import { AppApiError, httpClient } from "@/shared/api";
import type { ApiResponse } from "@/shared/api";
import type { AdminReport, ReportAction, ReportDetailResponse, ReportListParams, ReportListResponse, ReportsPagination } from "../types";
import { reportEndpoints } from "./report.endpoints";

type ListData = { reports: AdminReport[] };

const pagination = (params: ReportListParams, meta: Record<string, unknown> | undefined): ReportsPagination => {
  const value = (meta?.pagination ?? {}) as Partial<ReportsPagination>;
  const total = Number(value.total) || 0;
  const page = Number(value.page) || params.page;
  const limit = Number(value.limit) || params.limit;
  return { page, limit, total, totalPages: Number(value.totalPages) || 0, from: total ? (page - 1) * limit + 1 : 0, to: total ? Math.min(page * limit, total) : 0 };
};

const requireReport = (response: ApiResponse<{ report: AdminReport }>): AdminReport => {
  if (!response.data?.report?.id) throw new AppApiError(response.message || "The report response was invalid.", { statusCode: response.statusCode, requestId: response.requestId });
  return response.data.report;
};

export const reportService = {
  async list(params: ReportListParams): Promise<ReportListResponse> {
    const response = await httpClient.get<ApiResponse<ListData>>(reportEndpoints.adminReports, { params });
    if (!Array.isArray(response.data.data?.reports)) throw new AppApiError(response.data.message || "The reports response was invalid.", { statusCode: response.data.statusCode, requestId: response.data.requestId });
    return { reports: response.data.data.reports, pagination: pagination(params, response.data.meta) };
  },
  async get(id: string): Promise<ReportDetailResponse> {
    const response = await httpClient.get<ApiResponse<ReportDetailResponse>>(reportEndpoints.adminReport(id));
    if (!response.data.data?.report?.id || !Array.isArray(response.data.data.relatedReports)) throw new AppApiError(response.data.message || "The report response was invalid.", { statusCode: response.data.statusCode, requestId: response.data.requestId });
    return response.data.data;
  },
  async action(id: string, action: ReportAction): Promise<AdminReport> {
    const response = await httpClient.patch<ApiResponse<{ report: AdminReport }>>(reportEndpoints.adminReportAction(id), { action });
    return requireReport(response.data);
  },
  async delete(id: string): Promise<void> {
    await httpClient.delete(reportEndpoints.adminReport(id));
  },
};
