import { AppApiError, httpClient } from "@/shared/api";
import type { ApiResponse } from "@/shared/api";
import type { PaymentManagementListParams, PaymentManagementListResponse } from "../types";
import { paymentManagementEndpoints } from "./payment-management.endpoints";

export const paymentManagementService = {
  async listPayments(
    params: PaymentManagementListParams,
    signal?: AbortSignal,
  ): Promise<PaymentManagementListResponse> {
    const response = await httpClient.get<ApiResponse<PaymentManagementListResponse>>(
      paymentManagementEndpoints.list,
      { params, signal },
    );
    const data = response.data.data;

    if (!data) {
      throw new AppApiError(response.data.message || "The payments response was empty.", {
        requestId: response.data.requestId,
        statusCode: response.data.statusCode,
      });
    }

    return data;
  },
};
