export type SupportTicketStatus = "pending" | "solved" | "dismissed";

export type SupportTicketRequester = {
  id: string;
  name: string;
  email: string;
  avatarKey?: string | null;
  avatarUrl?: string | null;
};

export type SupportTicketMessage = {
  id: string;
  senderType: "user" | "admin";
  senderId: string;
  senderName: string;
  title: string;
  body: string;
  createdAt: string;
};

export type SupportTicket = {
  id: string;
  requester: SupportTicketRequester;
  title: string;
  description: string;
  status: SupportTicketStatus;
  messages: SupportTicketMessage[];
  lastMessageAt: string;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SupportTicketsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  from: number;
  to: number;
};

export type SupportTicketListParams = {
  page: number;
  limit: number;
  search?: string;
  status?: SupportTicketStatus;
};

export type SupportTicketListResponse = {
  tickets: SupportTicket[];
};

export type SupportTicketResponse = {
  ticket: SupportTicket;
};
