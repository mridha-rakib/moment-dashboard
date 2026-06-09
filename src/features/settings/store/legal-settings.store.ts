import { create } from "zustand";
import { getApiErrorMessage } from "@/shared/api";
import type { LegalClause, LegalDocument, LegalDocumentType } from "../types";
import { defaultLegalDocuments, legalDocumentTypes } from "../constants/legal-documents";
import { legalSettingsService } from "../services/legal-settings.service";

type LegalTypeState = Record<LegalDocumentType, boolean>;
type LegalTypeErrors = Record<LegalDocumentType, string | null>;

interface LegalSettingsStore {
  documents: Record<LegalDocumentType, LegalDocument>;
  errors: LegalTypeErrors;
  fetched: LegalTypeState;
  isLoading: LegalTypeState;
  isSaving: LegalTypeState;
  fetchLegalDocument: (type: LegalDocumentType) => Promise<LegalDocument | null>;
  saveLegalClauses: (type: LegalDocumentType, clauses: LegalClause[]) => Promise<LegalDocument | null>;
}

const createTypeState = (value: boolean): LegalTypeState =>
  legalDocumentTypes.reduce(
    (state, type) => ({
      ...state,
      [type]: value,
    }),
    {} as LegalTypeState,
  );

const createTypeErrors = (): LegalTypeErrors =>
  legalDocumentTypes.reduce(
    (state, type) => ({
      ...state,
      [type]: null,
    }),
    {} as LegalTypeErrors,
  );

const isMongoObjectId = (value: string): boolean => /^[a-f\d]{24}$/i.test(value);

const toSavePayload = (document: LegalDocument, clauses: LegalClause[]) => ({
  displayOnLandingPage: document.displayOnLandingPage,
  clauses: clauses.map((clause, index) => ({
    ...(isMongoObjectId(clause.id) ? { id: clause.id } : {}),
    title: clause.title,
    body: clause.body,
    sortOrder: index,
  })),
});

export const useLegalSettingsStore = create<LegalSettingsStore>((set, get) => ({
  documents: defaultLegalDocuments,
  errors: createTypeErrors(),
  fetched: createTypeState(false),
  isLoading: createTypeState(false),
  isSaving: createTypeState(false),

  fetchLegalDocument: async (type) => {
    if (get().fetched[type]) {
      return get().documents[type];
    }

    set((state) => ({
      errors: { ...state.errors, [type]: null },
      isLoading: { ...state.isLoading, [type]: true },
    }));

    try {
      const document = await legalSettingsService.getLegalDocument(type);

      set((state) => ({
        documents: { ...state.documents, [type]: document },
        errors: { ...state.errors, [type]: null },
        fetched: { ...state.fetched, [type]: true },
        isLoading: { ...state.isLoading, [type]: false },
      }));

      return document;
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to load legal settings.");

      set((state) => ({
        errors: { ...state.errors, [type]: message },
        isLoading: { ...state.isLoading, [type]: false },
      }));

      return null;
    }
  },

  saveLegalClauses: async (type, clauses) => {
    set((state) => ({
      errors: { ...state.errors, [type]: null },
      isSaving: { ...state.isSaving, [type]: true },
    }));

    try {
      const currentDocument = get().documents[type];
      const document = await legalSettingsService.saveLegalDocument(type, toSavePayload(currentDocument, clauses));

      set((state) => ({
        documents: { ...state.documents, [type]: document },
        errors: { ...state.errors, [type]: null },
        fetched: { ...state.fetched, [type]: true },
        isSaving: { ...state.isSaving, [type]: false },
      }));

      return document;
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to save legal settings.");

      set((state) => ({
        errors: { ...state.errors, [type]: message },
        isSaving: { ...state.isSaving, [type]: false },
      }));

      return null;
    }
  },
}));
