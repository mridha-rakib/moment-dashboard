export const reportEndpoints = Object.freeze({
  adminReports: "/reports/admin",
  adminReport: (id: string) => `/reports/admin/${id}`,
  adminReportAction: (id: string) => `/reports/admin/${id}/action`,
});
