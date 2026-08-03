import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Search, MoreVertical, ChevronLeft, ChevronRight, Eye, X, DollarSign, CalendarDays } from 'lucide-react';
import { getApiErrorMessage } from '@/shared/api';
import { paymentManagementService } from '@/features/payments';

const itemsPerPage = 4;

const defaultPagination = {
  page: 1,
  limit: itemsPerPage,
  total: 0,
  totalPages: 0,
  from: 0,
  to: 0,
};

const formatAccountType = (accountType) => (accountType === 'business' ? 'Business' : 'Personal');

const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(date);
};

const formatMoney = (minor, currency) => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: (currency || 'usd').toUpperCase(),
    }).format((Number(minor) || 0) / 100);
  } catch {
    return `$${((Number(minor) || 0) / 100).toFixed(2)}`;
  }
};

const getAvatarUrl = (user) => {
  if (user.avatarUrl) return user.avatarUrl;

  const initial = (user.name || '?').trim().charAt(0).toUpperCase() || '?';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="100%" height="100%" fill="#E8EBFD"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="#6D67E4" font-family="Arial" font-size="40" font-weight="700">${initial.replace(/[<>&"']/g, '')}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const toIsoDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const statusTabs = [
  { id: 'all', label: 'All Payments' },
  { id: 'paid', label: 'Paid' },
  { id: 'refunded', label: 'Refunded' },
];

const PaymentManagement = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [appliedDateRange, setAppliedDateRange] = useState(null);

  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [draftStartDate, setDraftStartDate] = useState(new Date());
  const [draftEndDate, setDraftEndDate] = useState(new Date());
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [dateRangeError, setDateRangeError] = useState(null);

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(defaultPagination);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryToken, setRetryToken] = useState(0);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  const loadPayments = useCallback(
    async (signal) => {
      const requestId = ++requestIdRef.current;
      setIsLoading(true);
      setError(null);

      try {
        const params = {
          page: currentPage,
          limit: itemsPerPage,
          ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
          ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
          ...(appliedDateRange ? { start: appliedDateRange.start, end: appliedDateRange.end } : {}),
        };

        const result = await paymentManagementService.listPayments(params, signal);

        if (requestId !== requestIdRef.current) return;

        setItems(result.items);
        setPagination(result.pagination);
        if (result.pagination.totalPages > 0 && currentPage > result.pagination.totalPages) {
          setCurrentPage(result.pagination.totalPages);
        }
      } catch (loadError) {
        if (signal?.aborted) return;
        if (requestId !== requestIdRef.current) return;
        setItems([]);
        setPagination(defaultPagination);
        setError(getApiErrorMessage(loadError, 'Unable to load payments.'));
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [currentPage, debouncedSearch, statusFilter, appliedDateRange],
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadPayments(controller.signal);
    return () => controller.abort();
  }, [loadPayments, retryToken]);

  const totalPages = pagination.totalPages;
  const hasActiveFilters = statusFilter !== 'all' || Boolean(searchTerm) || Boolean(appliedDateRange);

  const visiblePages = useMemo(() => {
    if (totalPages === 0) return [];
    const start = Math.max(1, Math.min(currentPage - 2, Math.max(totalPages - 4, 1)));
    return Array.from({ length: Math.min(totalPages, 5) }, (_, index) => start + index);
  }, [currentPage, totalPages]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const resetAllFilters = () => {
    setStatusFilter('all');
    setSearchTerm('');
    setAppliedDateRange(null);
    setCurrentPage(1);
  };

  const openDateModal = () => {
    if (appliedDateRange) {
      setDraftStartDate(new Date(`${appliedDateRange.start}T00:00:00`));
      setDraftEndDate(new Date(`${appliedDateRange.end}T00:00:00`));
    }
    setDateRangeError(null);
    setIsDateModalOpen(true);
  };

  const closeDateModal = () => {
    setIsDateModalOpen(false);
    setDateRangeError(null);
  };

  const applyDateRange = () => {
    if (draftStartDate > draftEndDate) {
      setDateRangeError('Start date must not be after end date.');
      return;
    }
    const rangeDays = Math.round((draftEndDate - draftStartDate) / (24 * 60 * 60 * 1000)) + 1;
    if (rangeDays > 365) {
      setDateRangeError('Date range cannot exceed 365 days.');
      return;
    }

    setDateRangeError(null);
    setIsDateModalOpen(false);
    setCurrentPage(1);
    setAppliedDateRange({ start: toIsoDate(draftStartDate), end: toIsoDate(draftEndDate) });
  };

  const clearDateRange = () => {
    setAppliedDateRange(null);
    setCurrentPage(1);
    setIsDateModalOpen(false);
    setDateRangeError(null);
  };

  const openActionModal = (payment) => {
    setSelectedPayment(payment);
    setIsActionModalOpen(true);
  };

  const renderStatusBadge = (payment) => {
    const refundStatus = payment.refundSummary.status;

    if (refundStatus === 'full') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-500 dark:text-rose-400 rounded-full text-[11px] font-bold">
          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
          Refunded
        </span>
      );
    }

    if (refundStatus === 'partial') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-[11px] font-bold">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
          Partially Refunded
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 rounded-full text-[11px] font-bold">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
        Paid
      </span>
    );
  };

  return (
    <div className="space-y-8 relative">
      {/* Filters Panel */}
      <div className="bg-white dark:bg-[#1E1E2D] rounded-[24px] shadow-sm border border-gray-50 dark:border-gray-800 overflow-hidden transition-colors">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between p-6 border-b border-gray-50 dark:border-gray-800">
          {/* Payment Status Tabs */}
          <div className="flex bg-[#F8F9FD] dark:bg-[#2D2D3F] p-1 rounded-2xl w-full lg:w-auto">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id);
                  setCurrentPage(1);
                }}
                className={`flex-1 lg:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === tab.id
                    ? 'bg-white dark:bg-[#1E1E2D] text-[#6D67E4] dark:text-indigo-400 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search + Date Range + Reset */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-[280px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-10 py-3 bg-[#F8F9FD] dark:bg-[#2D2D3F] border border-transparent rounded-2xl text-sm text-[#1A1A4B] dark:text-white focus:border-[#6D67E4]/40 focus:ring-1 focus:ring-[#6D67E4]/40 transition-all outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-250"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              onClick={openDateModal}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition-all w-full sm:w-auto justify-center ${
                appliedDateRange
                  ? 'bg-[#E8EBFD] dark:bg-indigo-600/20 text-[#6D67E4] dark:text-indigo-400'
                  : 'bg-[#F8F9FD] dark:bg-[#2D2D3F] text-gray-500 dark:text-gray-300 hover:text-[#6D67E4]'
              }`}
            >
              <CalendarDays size={14} />
              {appliedDateRange ? `${appliedDateRange.start} – ${appliedDateRange.end}` : 'Date Range'}
            </button>

            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="w-full sm:w-auto px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 dark:border-gray-800 bg-[#FBFBFF]/50 dark:bg-[#2D2D3F]/50">
                <th className="px-8 py-5 text-[12px] font-bold text-[#8E8EBC] uppercase tracking-widest">Name</th>
                <th className="px-8 py-5 text-[12px] font-bold text-[#8E8EBC] uppercase tracking-widest">Account Type</th>
                <th className="px-8 py-5 text-[12px] font-bold text-[#8E8EBC] uppercase tracking-widest">Payment Status</th>
                <th className="px-8 py-5 text-[12px] font-bold text-[#8E8EBC] uppercase tracking-widest">Payment Date</th>
                <th className="px-8 py-5 text-[12px] font-bold text-[#8E8EBC] uppercase tracking-widest">Amount</th>
                <th className="px-8 py-5 text-[12px] font-bold text-[#8E8EBC] uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {isLoading && (
                Array.from({ length: itemsPerPage }, (_, index) => (
                  <tr key={`skeleton-${index}`} className="animate-pulse">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800" />
                        <div className="space-y-2">
                          <div className="h-3 w-28 rounded bg-gray-100 dark:bg-gray-800" />
                          <div className="h-2.5 w-36 rounded bg-gray-100 dark:bg-gray-800" />
                        </div>
                      </div>
                    </td>
                    {Array.from({ length: 4 }, (_, cellIndex) => (
                      <td key={cellIndex} className="px-8 py-5"><div className="h-3 w-16 rounded bg-gray-100 dark:bg-gray-800" /></td>
                    ))}
                    <td className="px-8 py-5" />
                  </tr>
                ))
              )}

              {!isLoading && error && (
                <tr>
                  <td colSpan="6" className="px-8 py-14">
                    <div className="text-center text-xs font-bold text-red-500 space-y-3">
                      <p>{error}</p>
                      <button
                        onClick={() => setRetryToken((token) => token + 1)}
                        className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && !error && items.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                      <div className="p-4 bg-gray-50 dark:bg-[#2D2D3F] rounded-full text-gray-400 dark:text-gray-500">
                        <DollarSign size={28} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#1A1A4B] dark:text-white">
                          {hasActiveFilters ? 'No payments match your filters' : 'No Ticket payments yet'}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">
                          {hasActiveFilters
                            ? 'Try adjusting your search, status, or date range.'
                            : 'Captured Ticket payments will appear here.'}
                        </p>
                      </div>
                      {hasActiveFilters && (
                        <button
                          onClick={resetAllFilters}
                          className="px-4 py-2 text-xs font-bold text-[#6D67E4] dark:text-indigo-400 hover:underline"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && !error && items.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50/50 dark:hover:bg-[#2D2D3F]/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <img
                        src={getAvatarUrl(payment.user)}
                        alt={payment.user.name}
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = getAvatarUrl({ name: payment.user.name });
                        }}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold text-[#1A1A4B] dark:text-white text-[15px] transition-colors">{payment.user.name}</p>
                        <p className="text-[12px] text-gray-400">{payment.user.email || 'No email'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-bold text-[#4B4B4B] dark:text-gray-300 text-[14px] transition-colors">
                      {formatAccountType(payment.user.accountType)}
                    </span>
                  </td>
                  <td className="px-8 py-5">{renderStatusBadge(payment)}</td>
                  <td className="px-8 py-5">
                    <span className="font-medium text-[#4B4B4B] dark:text-gray-400 text-[14px] transition-colors">
                      {formatDate(payment.paidAt)}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-bold text-[#1A1A4B] dark:text-white text-[15px] transition-colors block">
                      {formatMoney(payment.amountMinor, payment.currency)}
                    </span>
                    {payment.refundSummary.status !== 'none' && (
                      <span className="text-[11px] font-semibold text-rose-500 dark:text-rose-400">
                        Refunded: {formatMoney(payment.refundSummary.successfulRefundedMinor, payment.currency)}
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button
                      onClick={() => openActionModal(payment)}
                      className="p-1 rounded-lg text-gray-300 hover:text-gray-500 transition-colors"
                    >
                      <MoreVertical size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        {!isLoading && !error && items.length > 0 && (
          <div className="px-8 py-6 flex items-center justify-between border-t border-gray-50 dark:border-gray-800 transition-colors">
            <p className="text-[12px] text-gray-400 font-medium">
              Showing {pagination.from}-{pagination.to} of {pagination.total} payments
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-100 dark:border-gray-800 rounded-lg text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={18} />
              </button>

              {visiblePages.map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg font-bold text-sm transition-all ${
                    currentPage === pageNumber
                      ? 'bg-[#E8EBFD] dark:bg-indigo-600/20 text-[#6D67E4] dark:text-indigo-400'
                      : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2D2D3F]'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2 border border-gray-100 dark:border-gray-800 rounded-lg text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] disabled:opacity-30 transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Date Range Modal */}
      {isDateModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#1E1E2D] w-[480px] rounded-[32px] p-8 shadow-2xl border border-gray-100 dark:border-gray-800/40 animate-in zoom-in-95 duration-300 flex flex-col relative">
            <h2 className="text-[20px] font-bold text-[#1A1A4B] dark:text-white mb-6">Select Date Range</h2>

            <div className="grid grid-cols-2 gap-6 mb-4">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.15em] px-1">START DATE</p>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={draftStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    onClick={() => {
                      setShowStartCalendar(!showStartCalendar);
                      setShowEndCalendar(false);
                    }}
                    className="w-full px-4 py-3 bg-white dark:bg-[#2D2D3F] border border-gray-200 dark:border-gray-700 rounded-2xl text-[14px] font-medium text-gray-700 dark:text-gray-300 outline-none cursor-pointer hover:border-[#454070] transition-colors"
                  />
                  {showStartCalendar && (
                    <div className="absolute top-full left-0 mt-2 z-[120] shadow-2xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
                      <Calendar
                        onChange={(date) => {
                          setDraftStartDate(date);
                          setShowStartCalendar(false);
                        }}
                        value={draftStartDate}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.15em] px-1">END DATE</p>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={draftEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    onClick={() => {
                      setShowEndCalendar(!showEndCalendar);
                      setShowStartCalendar(false);
                    }}
                    className="w-full px-4 py-3 bg-white dark:bg-[#2D2D3F] border border-gray-200 dark:border-gray-700 rounded-2xl text-[14px] font-medium text-gray-700 dark:text-gray-300 outline-none cursor-pointer hover:border-[#454070] transition-colors"
                  />
                  {showEndCalendar && (
                    <div className="absolute top-full left-0 mt-2 z-[120] shadow-2xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
                      <Calendar
                        onChange={(date) => {
                          setDraftEndDate(date);
                          setShowEndCalendar(false);
                        }}
                        value={draftEndDate}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {dateRangeError && <p className="text-[12px] font-semibold text-rose-500 mb-4">{dateRangeError}</p>}

            <div className="flex justify-between items-center gap-3 pt-2">
              <button
                onClick={clearDateRange}
                className="px-5 py-3 text-[13px] font-bold text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors"
              >
                Clear
              </button>
              <div className="flex gap-3">
                <button
                  onClick={closeDateModal}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[14px] font-bold rounded-2xl hover:bg-gray-250 dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={applyDateRange}
                  className="px-6 py-3 bg-[#454070] dark:bg-indigo-600 text-white text-[14px] font-bold rounded-2xl hover:bg-[#34305c] dark:hover:bg-indigo-700 transition-all shadow-lg"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {isActionModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-md transition-opacity"
            onClick={() => setIsActionModalOpen(false)}
          ></div>

          <div className="relative bg-white dark:bg-[#1E1E2D] rounded-[32px] border border-gray-150 dark:border-gray-800 p-8 w-full max-w-[360px] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsActionModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center text-center mt-2 mb-6">
              <img
                src={getAvatarUrl(selectedPayment.user)}
                alt={selectedPayment.user.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500/20 shadow-md mb-3"
              />
              <h3 className="text-lg font-bold text-[#1A1A4B] dark:text-white leading-tight">
                {selectedPayment.user.name}
              </h3>
              <p className="text-xs text-gray-400 mt-1 font-medium">
                {selectedPayment.user.email || 'No email'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[11px] font-bold">
                <DollarSign size={12} />
                {formatMoney(selectedPayment.amountMinor, selectedPayment.currency)}
              </span>
              {renderStatusBadge(selectedPayment)}
            </div>

            <div className="space-y-3">
              <button
                className="flex items-center justify-center gap-3 w-full py-3.5 bg-indigo-50 dark:bg-indigo-600/10 text-[#6D67E4] dark:text-indigo-400 font-bold text-xs rounded-2xl hover:bg-[#E8EBFD] dark:hover:bg-indigo-600/20 transition-all cursor-pointer"
                onClick={() => {
                  navigate(`/payment-details/${selectedPayment.id}`);
                  setIsActionModalOpen(false);
                }}
              >
                <Eye size={16} />
                View Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;
