import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

// Sub-components
import SettingsTabs from '../../Components/Settings/SettingsTabs';
import GeneralSettings from '../../Components/Settings/GeneralSettings';
import Pricing from '../../Components/Settings/Pricing';
import DynamicLegalEditor from '../../Components/Settings/DynamicLegalEditor';
import { useLegalSettingsStore, usePricingSettingsStore } from '../../features/settings';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('General');
  const [editingText, setEditingText] = useState('');
  const legalDocuments = useLegalSettingsStore((state) => state.documents);
  const fetchLegalDocument = useLegalSettingsStore((state) => state.fetchLegalDocument);
  const saveLegalClauses = useLegalSettingsStore((state) => state.saveLegalClauses);
  const savingLegalDocuments = useLegalSettingsStore((state) => state.isSaving);
  const pricingSettings = usePricingSettingsStore((state) => state.settings);
  const fetchPricingSettings = usePricingSettingsStore((state) => state.fetchSettings);
  const savePricingValues = usePricingSettingsStore((state) => state.saveValues);
  const isPricingLoading = usePricingSettingsStore((state) => state.isLoading);
  const isPricingSaving = usePricingSettingsStore((state) => state.isSaving);
  const pricingError = usePricingSettingsStore((state) => state.error);

  // States that need to persist across tab switches
  const [pricingValues, setPricingValues] = useState({
    tax: 5,
    creditCardFee: 5,
    applePayoutFee: 5,
    platformFee: 5,
    productPercentage: 5,
    ticketPercentage: 5,
  });

  useEffect(() => {
    void fetchLegalDocument('terms');
    void fetchLegalDocument('privacy');
    void fetchPricingSettings();
  }, [fetchLegalDocument, fetchPricingSettings]);

  useEffect(() => {
    setPricingValues({
      tax: pricingSettings.tax,
      creditCardFee: pricingSettings.creditCardFee,
      applePayoutFee: pricingSettings.applePayoutFee,
      platformFee: pricingSettings.platformFee,
      productPercentage: pricingSettings.productPercentage,
      ticketPercentage: pricingSettings.ticketPercentage,
    });
  }, [
    pricingSettings.tax,
    pricingSettings.creditCardFee,
    pricingSettings.applePayoutFee,
    pricingSettings.platformFee,
    pricingSettings.productPercentage,
    pricingSettings.ticketPercentage,
  ]);

  const formatLastModified = (document) => {
    if (!document?.lastModifiedAt) {
      return 'Last modified by Admin on Oct 24, 2023';
    }

    const modifiedBy = document.lastModifiedBy?.name || 'Admin';
    const modifiedAt = new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(document.lastModifiedAt));

    return `Last modified by ${modifiedBy} on ${modifiedAt}`;
  };

  const handleSavePricingValues = async () => {
    const savedSettings = await savePricingValues(pricingValues);

    if (savedSettings) {
      setPricingValues({
        tax: savedSettings.tax,
        creditCardFee: savedSettings.creditCardFee,
        applePayoutFee: savedSettings.applePayoutFee,
        platformFee: savedSettings.platformFee,
        productPercentage: savedSettings.productPercentage,
        ticketPercentage: savedSettings.ticketPercentage,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] dark:bg-[#13131F] p-8 transition-colors duration-300">
      <div className="mx-auto max-w-[1400px] flex gap-12">

        {/* Workspace Sidebar Navigation */}
        <SettingsTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setEditingText={setEditingText}
        />

        {/* Settings Content Area */}
        <div className="flex-1">
          {activeTab === 'General' && (
            <GeneralSettings />
          )}


          {activeTab === 'Pricing' && (
            <Pricing
              values={pricingValues}
              setValues={setPricingValues}
              isLoading={isPricingLoading}
              isSaving={isPricingSaving}
              error={pricingError}
              onCancel={() => setPricingValues({
                tax: pricingSettings.tax,
                creditCardFee: pricingSettings.creditCardFee,
                applePayoutFee: pricingSettings.applePayoutFee,
                platformFee: pricingSettings.platformFee,
                productPercentage: pricingSettings.productPercentage,
                ticketPercentage: pricingSettings.ticketPercentage,
              })}
              onSave={handleSavePricingValues}
              lastModifiedText={formatLastModified(pricingSettings)}
            />
          )}

          {activeTab === 'Terms & Conditions' && (
            <DynamicLegalEditor
              type="terms"
              title="Terms & Conditions"
              subtitle="Set terms & conditions of your Mooment app"
              content={legalDocuments.terms.clauses}
              setContent={(content) => saveLegalClauses('terms', content)}
              editingText={editingText}
              setEditingText={setEditingText}
              isSaving={savingLegalDocuments.terms}
              lastModifiedText={formatLastModified(legalDocuments.terms)}
            />
          )}

          {activeTab === 'Privacy & Policy' && (
            <DynamicLegalEditor
              type="privacy"
              title="Privacy & Policy"
              subtitle="Set privacy & policy of your Mooment app"
              content={legalDocuments.privacy.clauses}
              setContent={(content) => saveLegalClauses('privacy', content)}
              editingText={editingText}
              setEditingText={setEditingText}
              isSaving={savingLegalDocuments.privacy}
              lastModifiedText={formatLastModified(legalDocuments.privacy)}
            />
          )}

          {/* Placeholder for future settings */}
          {activeTab === 'Settings' && (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-300 animate-in zoom-in duration-500">
              <SettingsIcon size={48} className="mb-4 opacity-20" />
              <p className="text-lg font-bold">This section is coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
