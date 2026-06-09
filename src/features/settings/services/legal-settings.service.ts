import { AppApiError, httpClient } from "@/shared/api";
import type { ApiResponse } from "@/shared/api";
import type { LegalDocument, LegalDocumentResponse, LegalDocumentType, SaveLegalDocumentPayload } from "../types";
import { settingsEndpoints } from "./settings.endpoints";

const unwrapDocument = (response: ApiResponse<LegalDocumentResponse>): LegalDocument => {
  const document = response.data?.document;

  if (!document) {
    throw new AppApiError(response.message || "The settings response did not include a legal document.", {
      requestId: response.requestId,
      statusCode: response.statusCode,
    });
  }

  return document;
};

export const legalSettingsService = {
  async getLegalDocument(type: LegalDocumentType): Promise<LegalDocument> {
    const response = await httpClient.get<ApiResponse<LegalDocumentResponse>>(settingsEndpoints.legalDocument(type));
    return unwrapDocument(response.data);
  },

  async saveLegalDocument(
    type: LegalDocumentType,
    payload: SaveLegalDocumentPayload,
  ): Promise<LegalDocument> {
    const response = await httpClient.put<ApiResponse<LegalDocumentResponse>>(
      settingsEndpoints.legalDocument(type),
      payload,
    );

    return unwrapDocument(response.data);
  },
};
