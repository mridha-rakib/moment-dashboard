export type LegalDocumentType = "terms" | "privacy";

export interface LegalClause {
  id: string;
  title: string;
  body: string;
  sortOrder: number;
}

export interface LegalDocumentModifier {
  id: string;
  name: string;
  email: string;
}

export interface LegalDocument {
  id: string | null;
  type: LegalDocumentType;
  title: string;
  subtitle: string;
  clauses: LegalClause[];
  displayOnLandingPage: boolean;
  lastModifiedBy?: LegalDocumentModifier;
  lastModifiedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SaveLegalDocumentPayload {
  clauses: Array<{
    id?: string;
    title: string;
    body: string;
    sortOrder?: number;
  }>;
  displayOnLandingPage?: boolean;
}

export interface LegalDocumentResponse {
  document: LegalDocument;
}

export interface MoomentCreditPackage {
  id: string;
  name: string;
  credits: number;
  priceUsd: number;
  commissionPercent: number;
  sortOrder: number;
}

export interface MoomentCreditSettings {
  id: string | null;
  title: string;
  subtitle: string;
  packages: MoomentCreditPackage[];
  lastModifiedBy?: LegalDocumentModifier;
  lastModifiedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SaveMoomentCreditSettingsPayload {
  packages: Array<{
    id?: string;
    name: string;
    credits: number;
    priceUsd: number;
    commissionPercent: number;
    sortOrder?: number;
  }>;
}

export interface MoomentCreditSettingsResponse {
  settings: MoomentCreditSettings;
}

export interface PricingSettingsValues {
  tax: number;
  creditCardFee: number;
  applePayoutFee: number;
  platformFee: number;
  productPercentage: number;
  ticketPercentage: number;
}

export interface PricingSettings extends PricingSettingsValues {
  id: string | null;
  title: string;
  subtitle: string;
  lastModifiedBy?: LegalDocumentModifier;
  lastModifiedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SavePricingSettingsPayload extends PricingSettingsValues {}

export interface PricingSettingsResponse {
  settings: PricingSettings;
}
