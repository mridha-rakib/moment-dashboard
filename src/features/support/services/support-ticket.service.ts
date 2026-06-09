import { AppApiError, httpClient } from "@/shared/api";
import type { ApiResponse } from "@/shared/api";
import type {
  SupportTicket,
  SupportTicketListParams,
  SupportTicketListResponse,
  SupportTicketResponse,
  SupportTicketsPagination,
  SupportTicketStatus,
} from "../types";
import { supportTicketEndpoints } from "./support-ticket.endpoints";

const unwrapTicket = (response: ApiResponse<SupportTicketResponse>): SupportTicket => {
  const ticket = response.data?.ticket;

  if (!ticket) {
    throw new AppApiError(response.message || "The support response did not include a ticket.", {
      requestId: response.requestId,
      statusCode: response.statusCode,
    });
  }

  return ticket;
};

const unwrapTickets = (
  response: ApiResponse<SupportTicketListResponse>,
): { tickets: SupportTicket[]; pagination: SupportTicketsPagination } => {
  const tickets = response.data?.tickets;
  const pagination = response.meta?.pagination as SupportTicketsPagination | undefined;

  if (!tickets || !pagination) {
    throw new AppApiError(response.message || "The support response did not include tickets.", {
      requestId: response.requestId,
      statusCode: response.statusCode,
    });
  }

  return { tickets, pagination };
};

export const supportTicketService = {
  async listTickets(params: SupportTicketListParams) {
    const response = await httpClient.get<ApiResponse<SupportTicketListResponse>>(
      supportTicketEndpoints.adminTickets,
      { params },
    );

    return unwrapTickets(response.data);
  },

  async getTicket(id: string) {
    const response = await httpClient.get<ApiResponse<SupportTicketResponse>>(
      supportTicketEndpoints.adminTicket(id),
    );

    return unwrapTicket(response.data);
  },

  async updateStatus(id: string, status: SupportTicketStatus) {
    const response = await httpClient.patch<ApiResponse<SupportTicketResponse>>(
      supportTicketEndpoints.adminTicketStatus(id),
      { status },
    );

    return unwrapTicket(response.data);
  },

  async createMessage(id: string, body: string) {
    const response = await httpClient.post<ApiResponse<SupportTicketResponse>>(
      supportTicketEndpoints.adminTicketMessages(id),
      { body },
    );

    return unwrapTicket(response.data);
  },
};
