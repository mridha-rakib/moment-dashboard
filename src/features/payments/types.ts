export type PaymentManagementStatus = "paid" | "refunded";
export type RefundSummaryStatus = "none" | "partial" | "full";

export type PaymentManagementUser = {
  name: string;
  email: string | null;
  avatarUrl: string | null;
  accountType: "personal" | "business";
};

export type PaymentManagementRefundSummary = {
  successfulRefundedMinor: number;
  status: RefundSummaryStatus;
};

export type PaymentManagementItem = {
  id: string;
  user: PaymentManagementUser;
  paymentStatus: PaymentManagementStatus;
  paidAt: string;
  amountMinor: number;
  currency: string;
  refundSummary: PaymentManagementRefundSummary;
};

export type PaymentManagementPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  from: number;
  to: number;
};

export type PaymentManagementListResponse = {
  items: PaymentManagementItem[];
  pagination: PaymentManagementPagination;
};

export type PaymentManagementListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: PaymentManagementStatus;
  start?: string;
  end?: string;
};
