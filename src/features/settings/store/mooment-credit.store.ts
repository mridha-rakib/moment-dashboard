import { create } from "zustand";
import { getApiErrorMessage } from "@/shared/api";
import type { MoomentCreditPackage, MoomentCreditSettings } from "../types";
import { moomentCreditService } from "../services/mooment-credit.service";

interface MoomentCreditStore {
  error: string | null;
  fetched: boolean;
  isLoading: boolean;
  isSaving: boolean;
  settings: MoomentCreditSettings;
  fetchSettings: () => Promise<MoomentCreditSettings | null>;
  savePackages: (packages: MoomentCreditPackage[]) => Promise<MoomentCreditSettings | null>;
}

const defaultSettings: MoomentCreditSettings = {
  id: null,
  title: "Mooment Credit",
  subtitle: "Manage Mooment credit of your app",
  packages: [
    {
      id: "draft-default",
      name: "25 Mooments credit for",
      credits: 25,
      priceUsd: 26.25,
      commissionPercent: 5,
      sortOrder: 0,
    },
  ],
};

const isMongoObjectId = (value: string): boolean => /^[a-f\d]{24}$/i.test(value);

const toSavePayload = (packages: MoomentCreditPackage[]) => ({
  packages: packages.map((pkg, index) => ({
    ...(isMongoObjectId(pkg.id) ? { id: pkg.id } : {}),
    name: pkg.name,
    credits: Number(pkg.credits),
    priceUsd: Number(pkg.priceUsd),
    commissionPercent: Number(pkg.commissionPercent),
    sortOrder: index,
  })),
});

export const useMoomentCreditStore = create<MoomentCreditStore>((set, get) => ({
  error: null,
  fetched: false,
  isLoading: false,
  isSaving: false,
  settings: defaultSettings,

  fetchSettings: async () => {
    if (get().fetched) {
      return get().settings;
    }

    set({ error: null, isLoading: true });

    try {
      const settings = await moomentCreditService.getSettings();

      set({
        error: null,
        fetched: true,
        isLoading: false,
        settings,
      });

      return settings;
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to load Mooment credit settings.");

      set({
        error: message,
        isLoading: false,
      });

      return null;
    }
  },

  savePackages: async (packages) => {
    set({ error: null, isSaving: true });

    try {
      const settings = await moomentCreditService.saveSettings(toSavePayload(packages));

      set({
        error: null,
        fetched: true,
        isSaving: false,
        settings,
      });

      return settings;
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to save Mooment credit settings.");

      set({
        error: message,
        isSaving: false,
      });

      return null;
    }
  },
}));
