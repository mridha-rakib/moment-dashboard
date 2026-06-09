import type { LegalDocumentType } from "../types";

export const settingsEndpoints = Object.freeze({
  legalDocument: (type: LegalDocumentType) => `/settings/legal-documents/${type}`,
  moomentCredit: "/settings/mooment-credit",
  pricing: "/settings/pricing",
});
