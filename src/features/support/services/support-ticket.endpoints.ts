export const supportTicketEndpoints = Object.freeze({
  adminTickets: "/support/admin/tickets",
  adminTicket: (id: string) => `/support/admin/tickets/${id}`,
  adminTicketStatus: (id: string) => `/support/admin/tickets/${id}/status`,
  adminTicketMessages: (id: string) => `/support/admin/tickets/${id}/messages`,
});
