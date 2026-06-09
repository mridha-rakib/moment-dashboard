import type { LegalDocument, LegalDocumentType } from "../types";

export const legalDocumentTypes = ["terms", "privacy"] as const;

export const legalDocumentTypeByTab = {
  "Terms & Conditions": "terms",
  "Privacy & Policy": "privacy",
} as const satisfies Record<string, LegalDocumentType>;

export const defaultLegalDocuments: Record<LegalDocumentType, LegalDocument> = {
  terms: {
    id: null,
    type: "terms",
    title: "Terms & Conditions",
    subtitle: "Set terms & conditions of your Mooment app",
    displayOnLandingPage: true,
    clauses: [
      {
        id: "default-terms-introduction",
        title: "Introduction",
        body: "Our platform unifies all customer communication channels: WhatsApp, Twilio (SMS), and Gmail into a single shared inbox. Teams can collaborate, assign conversations, and respond to customers without switching tools, making customer support faster, simpler, and more organized.",
        sortOrder: 0,
      },
    ],
  },
  privacy: {
    id: null,
    type: "privacy",
    title: "Privacy & Policy",
    subtitle: "Set privacy & policy of your Mooment app",
    displayOnLandingPage: true,
    clauses: [
      {
        id: "default-privacy-data-collection",
        title: "Data Collection",
        body: "We value your privacy and are committed to protecting your personal data. This policy outlines how we collect, use, and safeguard your information when you use our Mooment application and services.",
        sortOrder: 0,
      },
    ],
  },
};
