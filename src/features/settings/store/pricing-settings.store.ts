import { create } from "zustand";
import { getApiErrorMessage } from "@/shared/api";
import type { PricingSettings, PricingSettingsValues } from "../types";
import { pricingSettingsService } from "../services/pricing-settings.service";

interface PricingSettingsStore {
  error: string | null;
  fetched: boolean;
  isLoading: boolean;
  isSaving: boolean;
  settings: PricingSettings;
  fetchSettings: () => Promise<PricingSettings | null>;
  saveValues: (values: PricingSettingsValues) => Promise<PricingSettings | null>;
}

export const defaultPricingSettings: PricingSettings = {
  id: null,
  title: "Pricing",
  subtitle: "Manage pricing of your app",
  tax: 5,
  creditCardFee: 5,
  applePayoutFee: 5,
  platformFee: 5,
  productPercentage: 5,
  ticketPercentage: 5,
};

const toSavePayload = (values: PricingSettingsValues): PricingSettingsValues => ({
  tax: Number(values.tax),
  creditCardFee: Number(values.creditCardFee),
  applePayoutFee: Number(values.applePayoutFee),
  platformFee: Number(values.platformFee),
  productPercentage: Number(values.productPercentage),
  ticketPercentage: Number(values.ticketPercentage),
});

export const usePricingSettingsStore = create<PricingSettingsStore>((set, get) => ({
  error: null,
  fetched: false,
  isLoading: false,
  isSaving: false,
  settings: defaultPricingSettings,

  fetchSettings: async () => {
    if (get().fetched) {
      return get().settings;
    }

    set({ error: null, isLoading: true });

    try {
      const settings = await pricingSettingsService.getSettings();

      set({
        error: null,
        fetched: true,
        isLoading: false,
        settings,
      });

      return settings;
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to load pricing settings.");

      set({
        error: message,
        isLoading: false,
      });

      return null;
    }
  },

  saveValues: async (values) => {
    set({ error: null, isSaving: true });

    try {
      const settings = await pricingSettingsService.saveSettings(toSavePayload(values));

      set({
        error: null,
        fetched: true,
        isSaving: false,
        settings,
      });

      return settings;
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to save pricing settings.");

      set({
        error: message,
        isSaving: false,
      });

      return null;
    }
  },
}));
