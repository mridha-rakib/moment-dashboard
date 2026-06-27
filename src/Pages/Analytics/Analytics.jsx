import React from 'react';
import { Settings2 } from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import RevenueMetrics from '../../Components/Analytics/RevenueMetrics';
import PackageDistribution from '../../Components/Analytics/PackageDistribution';
import UserMetrics from '../../Components/Analytics/UserMetrics';
import StatsCard from '../../Components/Dashboard/StatsCard';

const Analytics = () => {
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
    },
    {
      title: 'Ticket',
      value: '$420.00',
      change: '+ 12%',
      pillColor: 'bg-red-50 text-red-400',
    },
    {
      title: 'Product',
      value: '$100.00',
      change: '+ 5%',
      pillColor: 'bg-green-50 text-green-400',
    },
    {
      title: 'Total Revenue',
      value: '$520.00',
      showIcon: true,
      icon: Settings2,
    }
  ];

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
                onClick={() => handleFilterClick(filter)}
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
            <div className="bg-white dark:bg-[#1E1E2D] w-[504px] h-[446px] rounded-[40px] p-6 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col relative">
              <h2 className="text-[24px] font-bold text-[#1A1A4B] dark:text-white mb-4">Select Custom Period</h2>

              {/* Quick Select */}
              <div className="space-y-3 mb-4">
                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.15em]">QUICK SELECT</p>
                <div className="flex flex-wrap gap-2.5">
                  {['Today', 'Last 7 days', 'Last 30 days', 'Last 90 days'].map((q) => (
                    <button
                      key={q}
                      onClick={() => setSelectedQuick(q)}
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
                      <select className="w-full px-6 py-3 bg-white dark:bg-[#2D2D3F] border border-[#CBD5E1] dark:border-gray-700 rounded-2xl text-[14px] font-medium text-[#64748B] outline-none appearance-none cursor-pointer hover:border-[#454070] transition-colors">
                        <option>November</option>
                        <option>December</option>
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 9l6 6 6-6"></path>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.15em] px-1">YEAR</p>
                    <div className="relative">
                      <select className="w-full px-6 py-3 bg-white dark:bg-[#2D2D3F] border border-[#CBD5E1] dark:border-gray-700 rounded-2xl text-[14px] font-medium text-[#64748B] outline-none appearance-none cursor-pointer hover:border-[#454070] transition-colors">
                        <option>2026</option>
                        <option>2025</option>
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                  className="px-8 py-3 bg-[#F1F5F9] text-[#475569] text-[15px] font-bold rounded-2xl hover:bg-[#E2E8F0] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-3 bg-[#111111] text-white text-[15px] font-bold rounded-2xl hover:bg-black transition-all shadow-lg"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 mb-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Middle Row: Revenue and Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <RevenueMetrics />
          </div>
          <div className="lg:col-span-1">
            <PackageDistribution />
          </div>
        </div>

        {/* Bottom Row: User Metrics */}
        <div className="grid grid-cols-1 gap-8">
          <UserMetrics />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
