import type { LegalDocumentType } from "../types";

export const settingsEndpoints = Object.freeze({
  legalDocument: (type: LegalDocumentType) => `/settings/legal-documents/${type}`,
  pricing: "/settings/pricing",
});
