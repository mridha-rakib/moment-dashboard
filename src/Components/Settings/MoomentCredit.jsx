import React from 'react';
import { Plus, Trash2, DollarSign, Percent } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

const MoomentCredit = ({
  creditPackages,
  setCreditPackages,
  isLoading,
  isSaving,
  error,
  onCancel,
  onSave,
  lastModifiedText
}) => {
  const createDraftPackage = () => {
    const fallbackCredits = 25;
    const fallbackUnitPrice = 1.05;
    const existingCredits = creditPackages
      .map((pkg) => Number(pkg.credits))
      .filter((credits) => Number.isFinite(credits) && credits > 0);
    const largestCredits = existingCredits.length > 0 ? Math.max(...existingCredits) : 0;
    const previousPackage = creditPackages[creditPackages.length - 1] ?? {};
    const previousCredits = Number(previousPackage.credits);
    const previousPriceUsd = Number(previousPackage.priceUsd);
    const previousCommission = Number(previousPackage.commissionPercent);
    const unitPrice =
      Number.isFinite(previousCredits) && previousCredits > 0 && Number.isFinite(previousPriceUsd) && previousPriceUsd > 0
        ? previousPriceUsd / previousCredits
        : fallbackUnitPrice;
    const nextCredits = (largestCredits || 0) + fallbackCredits;
    const nextPriceUsd = Number((nextCredits * unitPrice).toFixed(2));
    const commissionPercent =
      Number.isFinite(previousCommission) && previousCommission >= 0 && previousCommission <= 100
        ? previousCommission
        : 5;

    return {
      id: `draft-${Date.now()}-${creditPackages.length}`,
      name: `${nextCredits} Mooments credit for`,
      credits: nextCredits,
      priceUsd: nextPriceUsd,
      commissionPercent,
      sortOrder: creditPackages.length,
    };
  };

  const handleAddPackage = () => {
    setCreditPackages([
      ...creditPackages,
      createDraftPackage(),
    ]);
  };

  const handleDeletePackage = (id) => {
    setCreditPackages(creditPackages.filter(p => p.id !== id));
  };

  const handlePackageChange = (id, field) => (event) => {
    setCreditPackages(creditPackages.map((pkg) => (
      pkg.id === id ? { ...pkg, [field]: event.target.value } : pkg
    )));
  };

  const isDraftPackage = (pkg) => String(pkg.id).startsWith('draft-');

  const hasInvalidPackage = creditPackages.some((pkg) => {
    const credits = Number(pkg.credits);
    const priceUsd = Number(pkg.priceUsd);
    const commissionPercent = Number(pkg.commissionPercent);

    return (
      !String(pkg.name).trim() ||
      !Number.isFinite(credits) ||
      !Number.isFinite(priceUsd) ||
      !Number.isFinite(commissionPercent) ||
      credits <= 0 ||
      priceUsd <= 0 ||
      commissionPercent < 0 ||
      commissionPercent > 100
    );
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A4B] dark:text-white transition-colors">Mooment Credit</h2>
          <p className="text-sm text-gray-400 font-medium">Manage Mooment credit of your app</p>
        </div>
        <p className="text-[11px] text-gray-300 font-bold uppercase tracking-widest mt-2">{lastModifiedText}</p>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 dark:bg-red-900/10 dark:text-red-300">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
          <Spinner className="size-4" />
          Loading Mooment credit packages...
        </div>
      )}

      {creditPackages.map((pkg, index) => (
        <div key={pkg.id} className="bg-white dark:bg-[#1E1E2D] rounded-[32px] p-10 shadow-sm border border-gray-50 dark:border-gray-800 space-y-8 relative group transition-colors">
          {index > 0 && (
            <button
              onClick={() => handleDeletePackage(pkg.id)}
              disabled={isSaving}
              className="absolute top-8 right-8 p-2.5 bg-red-50 dark:bg-red-900/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
            >
              <Trash2 size={18} />
            </button>
          )}

          <h3 className="text-lg font-bold text-[#1A1A4B] dark:text-white transition-colors">Mooment Credit Package</h3>


          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-300 uppercase tracking-widest px-1">PACKAGE NAME</label>
              <input
                type="text"
                value={pkg.name}
                onChange={handlePackageChange(pkg.id, 'name')}
                disabled={isSaving}
                placeholder="25 Mooments credit for"
                className="w-full px-6 py-3.5 bg-white dark:bg-[#2D2D3F] border border-gray-100 dark:border-gray-800 rounded-2xl text-sm font-bold text-[#1A1A4B] dark:text-white outline-none focus:ring-2 focus:ring-[#4B4B8A]/10 shadow-sm transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-300 uppercase tracking-widest px-1">MOOMENT CREDIT</label>
              <input
                type="text"
                value={pkg.credits}
                onChange={handlePackageChange(pkg.id, 'credits')}
                disabled={isSaving}
                placeholder="25"
                className="w-full px-6 py-3.5 bg-white dark:bg-[#2D2D3F] border border-gray-100 dark:border-gray-800 rounded-2xl text-sm font-bold text-[#1A1A4B] dark:text-white outline-none focus:ring-2 focus:ring-[#4B4B8A]/10 shadow-sm transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-300 uppercase tracking-widest px-1">USD</label>
              <div className="relative">
                <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                <input
                  type="text"
                  value={pkg.priceUsd}
                  onChange={handlePackageChange(pkg.id, 'priceUsd')}
                  disabled={isSaving}
                  placeholder="26.25"
                  className="w-full pl-14 pr-6 py-3.5 bg-white dark:bg-[#2D2D3F] border border-gray-100 dark:border-gray-800 rounded-2xl text-sm font-bold text-[#1A1A4B] dark:text-white outline-none focus:ring-2 focus:ring-[#4B4B8A]/10 shadow-sm transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-300 uppercase tracking-widest px-1">COMISSION</label>
              <div className="relative">
                <Percent className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                <input
                  type="text"
                  value={pkg.commissionPercent}
                  onChange={handlePackageChange(pkg.id, 'commissionPercent')}
                  disabled={isSaving}
                  placeholder="5"
                  className="w-full px-6 py-3.5 bg-white dark:bg-[#2D2D3F] border border-gray-100 dark:border-gray-800 rounded-2xl text-sm font-bold text-[#1A1A4B] dark:text-white outline-none focus:ring-2 focus:ring-[#4B4B8A]/10 shadow-sm transition-colors"
                />
              </div>
            </div>

          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={handleAddPackage}
              disabled={isSaving}
              className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[#4B4B8A] dark:hover:text-white transition-colors"
            >
              <Plus size={18} /> Add Package
            </button>
            <div className="flex gap-4">
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
                disabled={isSaving || hasInvalidPackage}
                className="inline-flex min-w-[154px] items-center justify-center gap-2 px-8 py-2.5 bg-[#4B4B8A] dark:bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-[#3B3B7A] dark:hover:bg-indigo-700 transition-all shadow-lg shadow-[#4B4B8A]/20 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Spinner className="size-4 text-white" />
                    Saving...
                  </>
                ) : (
                  isDraftPackage(pkg) ? 'Add Package' : 'Update Package'
                )}
              </button>
            </div>
          </div>

        </div>
      ))}
    </div>
  );
};

export default MoomentCredit;
