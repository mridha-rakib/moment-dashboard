import React from 'react';
import { Percent } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

const Pricing = ({
  values,
  setValues,
  isLoading,
  isSaving,
  error,
  onCancel,
  onSave,
  lastModifiedText,
}) => {
  const fields = [
    { key: 'tax', label: 'TAX' },
    { key: 'creditCardFee', label: 'CREDIT CARD FEE' },
    { key: 'applePayoutFee', label: 'APPLE PAYOUT FEE' },
    { key: 'platformFee', label: 'PLAFORM FEE' },
    { key: 'productPercentage', label: 'PRODUCT PERCENTAGE' },
    { key: 'ticketPercentage', label: 'TICKET PERCENTAGE' },
  ];

  const handleChange = (key) => (event) => {
    setValues({
      ...values,
      [key]: event.target.value,
    });
  };

  const hasInvalidValue = fields.some((field) => {
    const value = Number(values[field.key]);

    return !Number.isFinite(value) || value < 0 || value > 100;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A4B] dark:text-white transition-colors">Pricing</h2>
          <p className="text-sm text-[#5E598B] font-medium">Manage pricing of your app</p>
        </div>
        <p className="text-[11px] text-[#64748B] font-bold uppercase tracking-widest mt-2">{lastModifiedText}</p>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 dark:bg-red-900/10 dark:text-red-300">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
          <Spinner className="size-4" />
          Loading pricing settings...
        </div>
      )}

      <div className="bg-white dark:bg-[#1E1E2D] rounded-[32px] p-10 shadow-sm border border-gray-50 dark:border-gray-800 space-y-8 transition-colors">
        {fields.map((field) => (
          <div key={field.key} className="space-y-2">
            <label className="text-[10px] font-bold text-[#16123E] uppercase tracking-widest px-1">{field.label}</label>
            <div className="relative">
              <Percent className="absolute right-6 top-1/2 -translate-y-1/2 text-[#454070]" size={16} />
              <input
                type="text"
                value={values[field.key]}
                onChange={handleChange(field.key)}
                disabled={isSaving}
                className="w-full px-6 py-3.5 bg-white dark:bg-[#2D2D3F] border border-gray-100 dark:border-gray-800 rounded-2xl text-sm font-bold text-[#1A1A4B] dark:text-white outline-none focus:ring-2 focus:ring-[#4B4B8A]/10 shadow-sm transition-colors"
              />
            </div>
          </div>
        ))}


        <div className="flex justify-end gap-4 pt-8">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="px-8 py-2.5 bg-gray-200/50 dark:bg-[#2D2D3F] text-gray-500 dark:text-gray-400 text-sm font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-[#3D3D4F] transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || hasInvalidValue}
            className="inline-flex min-w-[88px] items-center justify-center gap-2 px-8 py-2.5 bg-[#1A1A4B] dark:bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-black dark:hover:bg-indigo-700 transition-all shadow-lg shadow-black/10 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Spinner className="size-4 text-white" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Pricing;
