import React from 'react';
import {
  Users, Ticket, DollarSign, RotateCcw, BadgeCheck, Percent, Gift, Sparkles,
  CheckCircle2, Ban, Undo2, Building2, Clock3, XCircle, AlertTriangle,
} from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { CreditCardPosIcon } from '@hugeicons/core-free-icons';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import RecentMoomentOnboarding from '../../Components/Dashboard/RecentMoomentOnboarding';
import EventMap from '../../Components/Dashboard/EventMap';
import StatsCard from '../../Components/Dashboard/StatsCard';
import { dashboardService } from '@/features/dashboard';
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

const formatChangeBadge = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  const rounded = Math.round(value * 10) / 10;
  return `${rounded > 0 ? '+' : ''}${rounded}%`;
};

const secondaryColorMap = {
  indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
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

const TicketStatTile = ({ label, value, caption, icon: Icon, color = 'indigo' }) => (
  <div className="bg-white dark:bg-[#1E1E2D] p-5 rounded-[20px] shadow-sm border border-gray-100 dark:border-gray-800/80 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase">{label}</span>
      {Icon && (
        <div className={`p-2 rounded-lg ${secondaryColorMap[color] || secondaryColorMap.indigo}`}>
          <Icon size={14} />
        </div>
      )}
    </div>
    <div>
      <p className="text-[22px] font-extrabold tracking-tight text-[#1A1A4B] dark:text-white">{value}</p>
      {caption && <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 mt-0.5">{caption}</p>}
    </div>
  </div>
);

const TicketStatTileSkeleton = () => (
  <div className="bg-white dark:bg-[#1E1E2D] p-5 rounded-[20px] shadow-sm border border-gray-100 dark:border-gray-800/80 h-[104px] flex flex-col justify-between animate-pulse">
    <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
    <div className="h-6 w-16 bg-gray-100 dark:bg-gray-800 rounded" />
  </div>
);

export default function Dashboard() {
  const [activeFilter, setActiveFilter] = React.useState('Today');
  const [appliedRange, setAppliedRange] = React.useState({ preset: 'today' });

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

    dashboardService
      .getOverview(appliedRange, controller.signal)
      .then((data) => {
        if (overviewRequestId.current !== requestId) return;
        setOverview(data);
        setIsOverviewLoading(false);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        if (overviewRequestId.current !== requestId) return;
        setOverviewError(getApiErrorMessage(error, 'Unable to load dashboard statistics.'));
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
    setAppliedRange({ preset: presetForFilter[filter] });
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
    setAppliedRange({ preset: 'custom', start: toIsoDate(startDate), end: toIsoDate(endDate) });
  };

  const users = overview?.users;
  const tickets = overview?.tickets;
  const financials = overview?.financials;

  const primaryStats = overview ? [
    {
      title: 'Total Users',
      value: formatCount(users.total),
      change: formatChangeBadge(users.newInPeriodChangePercentage),
      icon: Users,
      color: 'indigo',
    },
    {
      title: 'Tickets Issued',
      value: formatCount(tickets.issued),
      change: formatChangeBadge(tickets.issuedChangePercentage),
      icon: Ticket,
      color: 'rose',
    },
    {
      title: 'Gross Ticket Sales',
      value: formatMoney(financials.grossTicketSalesMinor, financials.currency),
      change: formatChangeBadge(financials.grossTicketSalesChangePercentage),
      icon: DollarSign,
      color: 'amber',
    },
    {
      title: 'Successful Refunds',
      value: formatMoney(financials.totalSuccessfulRefundsMinor, financials.currency),
      change: null,
      icon: RotateCcw,
      color: 'emerald',
    },
    {
      title: 'Net Ticket Revenue',
      value: formatMoney(financials.netTicketRevenueMinor, financials.currency),
      change: formatChangeBadge(financials.netTicketRevenueChangePercentage),
      icon: <HugeiconsIcon icon={CreditCardPosIcon} size={18} />,
      color: 'violet',
    },
  ] : [];

  const secondaryStats = overview ? [
    { label: 'Paid Passes', value: formatCount(tickets.paid), icon: BadgeCheck, color: 'indigo' },
    { label: 'Discounted Passes', value: formatCount(tickets.discounted), icon: Percent, color: 'amber' },
    { label: 'Free Passes', value: formatCount(tickets.free), icon: Gift, color: 'emerald' },
    { label: 'Rewarded / Bonus Passes', value: formatCount(tickets.rewardedOrBonus), icon: Sparkles, color: 'violet' },
    { label: 'Checked-In Passes', value: formatCount(tickets.checkedIn), icon: CheckCircle2, color: 'indigo' },
    { label: 'User-Cancelled Passes', value: formatCount(tickets.userCancelled), icon: Ban, color: 'rose' },
    {
      label: 'User Ticket Refunds',
      value: formatMoney(financials.userTicketRefundsMinor, financials.currency),
      caption: `${formatCount(financials.userTicketRefundCount)} refund${financials.userTicketRefundCount === 1 ? '' : 's'}`,
      icon: Undo2,
      color: 'rose',
    },
    {
      label: 'Host Event Cancellation Refunds',
      value: formatMoney(financials.hostEventCancellationRefundsMinor, financials.currency),
      caption: `${formatCount(financials.hostEventCancellationRefundCount)} refund${financials.hostEventCancellationRefundCount === 1 ? '' : 's'}`,
      icon: Building2,
      color: 'rose',
    },
    {
      label: 'Current Pending Refunds',
      value: formatMoney(financials.currentPendingRefundsMinor, financials.currency),
      caption: `${formatCount(financials.currentPendingRefundCount)} pending`,
      icon: Clock3,
      color: 'amber',
    },
    {
      label: 'Current Failed Refunds',
      value: formatMoney(financials.currentFailedRefundsMinor, financials.currency),
      caption: `${formatCount(financials.currentFailedRefundCount)} failed`,
      icon: XCircle,
      color: 'rose',
    },
    {
      label: 'Current Reconciliation-Required Refunds',
      value: formatMoney(financials.currentReconciliationRequiredRefundsMinor, financials.currency),
      caption: `${formatCount(financials.currentReconciliationRequiredRefundCount)} flagged`,
      icon: AlertTriangle,
      color: 'amber',
    },
  ] : [];

  return (
    <div className="min-h-screen p-8 bg-[#F8F9FD] dark:bg-[#13131F] transition-colors duration-300">
      <div className="mx-auto max-w-[1600px]">

        {/* Time Filters */}
        <div className="flex flex-col items-end gap-2 mb-6">
          <div className="bg-white dark:bg-[#1E1E2D] p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800/80 flex gap-1 transition-all duration-300">
            {timeFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => handleFilterClick(filter)}
                className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeFilter === filter
                    ? 'bg-[#454070] dark:bg-indigo-600 text-white shadow-md shadow-indigo-500/10'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
              >
                {filter}
              </button>
            ))}
          </div>
          {activeFilter === 'Custom' && appliedRange.preset === 'custom' && (
            <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">
              Showing {appliedRange.start} &ndash; {appliedRange.end}
            </p>
          )}
        </div>

        {/* Custom Date Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-[#1E1E2D] w-[504px] rounded-[32px] p-8 shadow-2xl border border-gray-100 dark:border-gray-800/40 animate-in zoom-in-95 duration-300 flex flex-col relative">
              <h2 className="text-[22px] font-bold text-[#1A1A4B] dark:text-white mb-6">Select Custom Period</h2>

              {/* Quick Select */}
              <div className="space-y-3 mb-6">
                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.15em]">QUICK SELECT</p>
                <div className="flex flex-wrap gap-2.5">
                  {Object.keys(quickSelectDays).map((q) => (
                    <button
                      key={q}
                      onClick={() => handleQuickSelect(q)}
                      className={`px-4.5 py-2 rounded-full border text-[13px] font-semibold transition-all duration-300 ${selectedQuick === q
                        ? "bg-[#454070] dark:bg-indigo-600 text-white border-[#454070] dark:border-indigo-600 shadow-md shadow-indigo-500/10"
                        : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-[#454070] dark:hover:border-indigo-500 hover:text-[#454070] dark:hover:text-indigo-400 bg-transparent"
                        }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Period Section */}
              <div className="space-y-5 mb-6 flex-1">
                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.15em]">CUSTOM PERIOD</p>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.15em] px-1">START DATE</p>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-gray-400 dark:text-gray-500">
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="3" y="4" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M3 8h14M7 3v2M13 3v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M7 12h2v2H7z" fill="currentColor" />
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
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#2D2D3F] border border-gray-200 dark:border-gray-700 rounded-2xl text-[14px] font-medium text-gray-700 dark:text-gray-300 outline-none cursor-pointer hover:border-[#454070] dark:hover:border-indigo-500 focus:border-[#454070] dark:focus:border-indigo-500 transition-colors"
                      />
                      {showStartCalendar && (
                        <div className="absolute top-full left-0 mt-2 z-[100] shadow-2xl rounded-2xl overflow-hidden border border-gray-150 dark:border-gray-800 animate-in fade-in slide-in-from-top-2 duration-200">
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
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-gray-400 dark:text-gray-500">
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="3" y="4" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M3 8h14M7 3v2M13 3v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M7 12h2v2H7z" fill="currentColor" />
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
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#2D2D3F] border border-gray-200 dark:border-gray-700 rounded-2xl text-[14px] font-medium text-gray-700 dark:text-gray-300 outline-none cursor-pointer hover:border-[#454070] dark:hover:border-indigo-500 focus:border-[#454070] dark:focus:border-indigo-500 transition-colors"
                      />
                      {showEndCalendar && (
                        <div className="absolute top-full left-0 mt-2 z-[100] shadow-2xl rounded-2xl overflow-hidden border border-gray-150 dark:border-gray-800 animate-in fade-in slide-in-from-top-2 duration-200">
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

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.15em] px-1">MONTH</p>
                    <div className="relative">
                      <select className="w-full px-6 py-3 bg-white dark:bg-[#2D2D3F] border border-gray-200 dark:border-gray-700 rounded-2xl text-[14px] font-medium text-gray-700 dark:text-gray-300 outline-none appearance-none cursor-pointer hover:border-[#454070] dark:hover:border-indigo-500 transition-colors">
                        <option>November</option>
                        <option>December</option>
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 9l6 6 6-6"></path>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.15em] px-1">YEAR</p>
                    <div className="relative">
                      <select className="w-full px-6 py-3 bg-white dark:bg-[#2D2D3F] border border-gray-200 dark:border-gray-700 rounded-2xl text-[14px] font-medium text-gray-700 dark:text-gray-300 outline-none appearance-none cursor-pointer hover:border-[#454070] dark:hover:border-indigo-500 transition-colors">
                        <option>2026</option>
                        <option>2025</option>
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 9l6 6 6-6"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {customRangeError && (
                <p className="text-[12px] font-semibold text-rose-500 mb-4">{customRangeError}</p>
              )}

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 pt-0">
                <button
                  onClick={closeCustomModal}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[14px] font-bold rounded-2xl hover:bg-gray-250 dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={applyCustomRange}
                  className="px-6 py-3 bg-[#454070] dark:bg-indigo-600 text-white text-[14px] font-bold rounded-2xl hover:bg-[#34305c] dark:hover:bg-indigo-750 transition-all shadow-lg shadow-indigo-500/10"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Primary Stats Grid */}
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
          <div className="grid grid-cols-1 gap-6 mb-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {isOverviewLoading && !overview
              ? Array.from({ length: 5 }).map((_, index) => <StatsCardSkeleton key={index} />)
              : primaryStats.map((stat, index) => <StatsCard key={index} {...stat} />)}
          </div>
        )}

        {/* Secondary Ticket Statistics */}
        {!overviewError || overview ? (
          <div className="mb-10">
            <h2 className="text-[16px] font-extrabold tracking-tight text-[#1A1A4B] dark:text-white mb-4">
              Ticket Statistics
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {isOverviewLoading && !overview
                ? Array.from({ length: 11 }).map((_, index) => <TicketStatTileSkeleton key={index} />)
                : secondaryStats.map((tile, index) => <TicketStatTile key={index} {...tile} />)}
            </div>
          </div>
        ) : null}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-3">

          {/* Recent Mooment Onboarding (Takes 2 columns) */}
          <div className="lg:col-span-2">
            <RecentMoomentOnboarding />
          </div>

          {/* Event Map (Takes 1 column) */}
          <div className="lg:col-span-1">
            <EventMap />
          </div>

        </div>
      </div>
    </div>
  );
}
