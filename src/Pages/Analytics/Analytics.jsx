import React from 'react';
import { Users, Ticket, DollarSign, RotateCcw } from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { CreditCardPosIcon } from '@hugeicons/core-free-icons';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import RevenueMetrics from '../../Components/Analytics/RevenueMetrics';
import PackageDistribution from '../../Components/Analytics/PackageDistribution';
import UserMetrics from '../../Components/Analytics/UserMetrics';
import StatsCard from '../../Components/Dashboard/StatsCard';
import { analyticsService } from '@/features/analytics';
import { getApiErrorMessage } from '@/shared/api';

const timeFilters = ['Today', '7D', '30D', 'Custom'];
const presetForFilter = { Today: 'today', '7D': '7d', '30D': '30d' };
const quickSelectDays = { Today: 0, 'Last 7 days': 6, 'Last 30 days': 29, 'Last 90 days': 89 };

const toIsoDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatCount = (value) => Number(value ?? 0).toLocaleString('en-US');

const formatChangeBadge = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  const rounded = Math.round(value * 10) / 10;
  return `${rounded > 0 ? '+' : ''}${rounded}%`;
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

const StatsCardSkeleton = () => (
  <div className="bg-white dark:bg-[#1E1E2D] p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800/80 h-[150px] flex flex-col justify-between animate-pulse">
    <div className="flex justify-between items-start">
      <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
      <div className="h-6 w-10 bg-gray-100 dark:bg-gray-800 rounded-full" />
    </div>
    <div className="h-8 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
  </div>
);

const ChartCardSkeleton = ({ heightClass }) => (
  <div className={`bg-white dark:bg-[#1E1E2D] p-8 rounded-[32px] shadow-sm border border-gray-50 dark:border-gray-800 w-full ${heightClass} animate-pulse flex flex-col gap-6`}>
    <div className="h-5 w-40 bg-gray-100 dark:bg-gray-800 rounded" />
    <div className="flex-1 bg-gray-50 dark:bg-gray-800/60 rounded-2xl" />
  </div>
);

const Analytics = () => {
  const [activeFilter, setActiveFilter] = React.useState('Today');
  const [appliedRange, setAppliedRange] = React.useState({ range: 'today' });

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedQuick, setSelectedQuick] = React.useState('Today');
  const [startDate, setStartDate] = React.useState(new Date());
  const [endDate, setEndDate] = React.useState(new Date());
  const [showStartCalendar, setShowStartCalendar] = React.useState(false);
  const [showEndCalendar, setShowEndCalendar] = React.useState(false);
  const [customRangeError, setCustomRangeError] = React.useState(null);

  const [overview, setOverview] = React.useState(null);
  const [isOverviewLoading, setIsOverviewLoading] = React.useState(true);
  const [overviewError, setOverviewError] = React.useState(null);
  const [retryToken, setRetryToken] = React.useState(0);
  const overviewRequestId = React.useRef(0);

  const formatDate = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  React.useEffect(() => {
    const controller = new AbortController();
    const requestId = ++overviewRequestId.current;
    setIsOverviewLoading(true);
    setOverviewError(null);

    analyticsService
      .getOverview(appliedRange, controller.signal)
      .then((data) => {
        if (overviewRequestId.current !== requestId) return;
        setOverview(data);
        setIsOverviewLoading(false);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        if (overviewRequestId.current !== requestId) return;
        setOverviewError(getApiErrorMessage(error, 'Unable to load analytics.'));
        setIsOverviewLoading(false);
      });

    return () => controller.abort();
  }, [appliedRange, retryToken]);

  const handleFilterClick = (filter) => {
    if (filter === 'Custom') {
      setIsModalOpen(true);
      return;
    }
    setActiveFilter(filter);
    setAppliedRange({ range: presetForFilter[filter] });
  };

  const openCustomModal = () => {
    // Initialize the modal's draft from the currently applied custom range
    // when one exists, so reopening Custom doesn't lose the applied dates.
    if (appliedRange.range === 'custom') {
      setStartDate(new Date(`${appliedRange.start}T00:00:00`));
      setEndDate(new Date(`${appliedRange.end}T00:00:00`));
    }
    setCustomRangeError(null);
    handleFilterClick('Custom');
  };

  const handleQuickSelect = (label) => {
    setSelectedQuick(label);
    const days = quickSelectDays[label] ?? 0;
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setStartDate(start);
    setEndDate(end);
  };

  const closeCustomModal = () => {
    setIsModalOpen(false);
    setCustomRangeError(null);
  };

  const applyCustomRange = () => {
    if (startDate > endDate) {
      setCustomRangeError('Start date must not be after end date.');
      return;
    }
    const rangeDays = Math.round((endDate - startDate) / (24 * 60 * 60 * 1000)) + 1;
    if (rangeDays > 365) {
      setCustomRangeError('Custom range cannot exceed 365 days.');
      return;
    }

    setCustomRangeError(null);
    setIsModalOpen(false);
    setActiveFilter('Custom');
    setAppliedRange({ range: 'custom', start: toIsoDate(startDate), end: toIsoDate(endDate) });
  };

  const summary = overview?.summary;
  const comparison = overview?.comparison;

  const primaryStats = overview ? [
    {
      title: 'Total Users',
      value: formatCount(summary.totalUsers),
      change: formatChangeBadge(comparison.usersChangePercentage),
      icon: Users,
      color: 'indigo',
    },
    {
      title: 'Tickets Issued',
      value: formatCount(summary.ticketsIssued),
      change: formatChangeBadge(comparison.ticketsChangePercentage),
      icon: Ticket,
      color: 'rose',
    },
    {
      title: 'Gross Ticket Sales',
      value: formatMoney(summary.grossTicketSalesMinor, summary.currency),
      change: formatChangeBadge(comparison.grossSalesChangePercentage),
      icon: DollarSign,
      color: 'amber',
    },
    {
      title: 'Successful Refunds',
      value: formatMoney(summary.successfulRefundsMinor, summary.currency),
      change: null,
      icon: RotateCcw,
      color: 'emerald',
    },
    {
      title: 'Net Ticket Revenue',
      value: formatMoney(summary.netTicketRevenueMinor, summary.currency),
      change: formatChangeBadge(comparison.netRevenueChangePercentage),
      icon: <HugeiconsIcon icon={CreditCardPosIcon} size={18} />,
      color: 'violet',
    },
  ] : [];

  return (
    <div className="min-h-screen p-8 bg-[#F8F9FD] dark:bg-[#13131F] transition-colors duration-300">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-[32px] font-bold text-[#1A1A4B] dark:text-white transition-colors">Analytics</h1>
          <div className="bg-white dark:bg-[#1E1E2D] p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex gap-1 transition-colors">
            {timeFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => (filter === 'Custom' ? openCustomModal() : handleFilterClick(filter))}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeFilter === filter
                    ? 'bg-[#E8EBFD] dark:bg-indigo-600/20 text-[#4F46E5] dark:text-indigo-400'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-[#1E1E2D] w-[504px] rounded-[40px] p-6 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col relative">
              <h2 className="text-[24px] font-bold text-[#1A1A4B] dark:text-white mb-4">Select Custom Period</h2>

              {/* Quick Select */}
              <div className="space-y-3 mb-4">
                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.15em]">QUICK SELECT</p>
                <div className="flex flex-wrap gap-2.5">
                  {Object.keys(quickSelectDays).map((q) => (
                    <button
                      key={q}
                      onClick={() => handleQuickSelect(q)}
                      className={`px-4 py-1.5 rounded-full border text-[13px] font-medium transition-all ${selectedQuick === q
                        ? "bg-[#454070] text-white border-[#454070]"
                        : "border-[#CBD5E1] text-[#64748B] hover:border-[#454070] hover:text-[#454070]"
                        }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Period Section */}
              <div className="space-y-4 mb-4 flex-1">
                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.15em]">CUSTOM PERIOD</p>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.15em] px-1">START DATE</p>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="3" y="4" width="14" height="14" rx="2" stroke="#454070" strokeWidth="1.5" />
                          <path d="M3 8h14M7 3v2M13 3v2" stroke="#454070" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M7 12h2v2H7z" fill="#454070" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        readOnly
                        value={formatDate(startDate)}
                        onClick={() => {
                          setShowStartCalendar(!showStartCalendar);
                          setShowEndCalendar(false);
                        }}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#2D2D3F] border border-[#CBD5E1] dark:border-gray-700 rounded-2xl text-[14px] font-medium text-[#64748B] outline-none cursor-pointer hover:border-[#454070] transition-colors"
                      />
                      {showStartCalendar && (
                        <div className="absolute top-full left-0 mt-2 z-[100] shadow-2xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-2 duration-200">
                          <Calendar
                            onChange={(date) => {
                              setStartDate(date);
                              setShowStartCalendar(false);
                              setSelectedQuick(null);
                            }}
                            value={startDate}
                            className="premium-calendar"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.15em] px-1">END DATE</p>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="3" y="4" width="14" height="14" rx="2" stroke="#454070" strokeWidth="1.5" />
                          <path d="M3 8h14M7 3v2M13 3v2" stroke="#454070" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M7 12h2v2H7z" fill="#454070" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        readOnly
                        value={formatDate(endDate)}
                        onClick={() => {
                          setShowEndCalendar(!showEndCalendar);
                          setShowStartCalendar(false);
                        }}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#2D2D3F] border border-[#CBD5E1] dark:border-gray-700 rounded-2xl text-[14px] font-medium text-[#64748B] outline-none cursor-pointer hover:border-[#454070] transition-colors"
                      />
                      {showEndCalendar && (
                        <div className="absolute top-full left-0 mt-2 z-[100] shadow-2xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-2 duration-200">
                          <Calendar
                            onChange={(date) => {
                              setEndDate(date);
                              setShowEndCalendar(false);
                              setSelectedQuick(null);
                            }}
                            value={endDate}
                            className="premium-calendar"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {customRangeError && (
                <p className="text-[12px] font-semibold text-rose-500 mb-3">{customRangeError}</p>
              )}
              {activeFilter === 'Custom' && appliedRange.range === 'custom' && (
                <p className="text-[12px] font-medium text-[#64748B] mb-3">
                  Currently applied: {appliedRange.start} &ndash; {appliedRange.end}
                </p>
              )}

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 pt-0">
                <button
                  onClick={closeCustomModal}
                  className="px-8 py-3 bg-[#F1F5F9] text-[#475569] text-[15px] font-bold rounded-2xl hover:bg-[#E2E8F0] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={applyCustomRange}
                  className="px-8 py-3 bg-[#111111] text-white text-[15px] font-bold rounded-2xl hover:bg-black transition-all shadow-lg"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {overviewError && !overview ? (
          <div className="mb-10 rounded-[24px] border border-red-400/20 bg-red-500/5 p-8 text-center">
            <p className="text-sm font-bold text-red-500 mb-3">{overviewError}</p>
            <button
              onClick={() => setRetryToken((token) => token + 1)}
              className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-xs font-bold text-red-500 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 mb-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {isOverviewLoading && !overview
                ? Array.from({ length: 5 }).map((_, index) => <StatsCardSkeleton key={index} />)
                : primaryStats.map((stat, index) => <StatsCard key={index} {...stat} />)}
            </div>

            {/* Middle Row: Revenue and Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2">
                {isOverviewLoading && !overview ? (
                  <ChartCardSkeleton heightClass="h-[500px]" />
                ) : (
                  <RevenueMetrics data={overview.revenueSeries} currency={overview.summary.currency} />
                )}
              </div>
              <div className="lg:col-span-1">
                {isOverviewLoading && !overview ? (
                  <ChartCardSkeleton heightClass="h-[500px]" />
                ) : (
                  <PackageDistribution
                    distribution={overview.ticketDistribution}
                    ticketsIssued={overview.summary.ticketsIssued}
                  />
                )}
              </div>
            </div>

            {/* Bottom Row: User Metrics */}
            <div className="grid grid-cols-1 gap-8">
              {isOverviewLoading && !overview ? (
                <ChartCardSkeleton heightClass="h-[400px]" />
              ) : (
                <UserMetrics series={overview.userMetrics.series} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
