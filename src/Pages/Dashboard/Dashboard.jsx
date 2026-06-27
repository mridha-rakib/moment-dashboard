import React from 'react';
import { Users, Ticket, Package, DollarSign, Clock, User, Settings2 } from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { CreditCardPosIcon } from '@hugeicons/core-free-icons';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import RecentMoomentOnboarding from '../../Components/Dashboard/RecentMoomentOnboarding';
import EventMap from '../../Components/Dashboard/EventMap';
import StatsCard from '../../Components/Dashboard/StatsCard';

export default function Dashboard() {
  const timeFilters = ['Today', '7D', '30D', 'Custom'];
  const [activeFilter, setActiveFilter] = React.useState('Today');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedQuick, setSelectedQuick] = React.useState('Today');
  const [startDate, setStartDate] = React.useState(new Date());
  const [endDate, setEndDate] = React.useState(new Date());
  const [showStartCalendar, setShowStartCalendar] = React.useState(false);
  const [showEndCalendar, setShowEndCalendar] = React.useState(false);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    if (filter === 'Custom') {
      setIsModalOpen(true);
    }
  };

  const stats = [
    {
      title: 'Total Users',
      value: '442',
      change: null,
      icon: Users,
      color: 'indigo'
    },
    {
      title: 'Ticket',
      value: '$420.00',
      change: '+ 12%',
      color: 'rose'
    },
    {
      title: 'Product',
      value: '$100.00',
      change: '+ 5%',
      color: 'emerald'
    },
    {
      title: 'Total Revenue',
      value: '$520.00',
      icon: <HugeiconsIcon icon={CreditCardPosIcon} size={18} />,
      color: 'violet'
    }
  ];

  // We automatically inject appropriate icons and defaults if missing to match custom color themes
  const enhancedStats = stats.map(stat => {
    if (!stat.icon) {
      if (stat.title.toLowerCase().includes('ticket')) stat.icon = Ticket;
      if (stat.title.toLowerCase().includes('product')) stat.icon = Package;
    }
    return stat;
  });

  return (
    <div className="min-h-screen p-8 bg-[#F8F9FD] dark:bg-[#13131F] transition-colors duration-300">
      <div className="mx-auto max-w-[1600px]">

        {/* Time Filters */}
        <div className="flex justify-end mb-6">
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
                  {['Today', 'Last 7 days', 'Last 30 days', 'Last 90 days'].map((q) => (
                    <button
                      key={q}
                      onClick={() => setSelectedQuick(q)}
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
              <div className="space-y-5 mb-8 flex-1">
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

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 pt-0">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[14px] font-bold rounded-2xl hover:bg-gray-250 dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 bg-[#454070] dark:bg-indigo-600 text-white text-[14px] font-bold rounded-2xl hover:bg-[#34305c] dark:hover:bg-indigo-750 transition-all shadow-lg shadow-indigo-500/10"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 mb-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {enhancedStats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

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
