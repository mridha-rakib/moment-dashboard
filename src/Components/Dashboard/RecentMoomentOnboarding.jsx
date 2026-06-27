import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Filter, X, Eye, Edit2, Trash2 } from 'lucide-react';

const RecentMoomentOnboarding = () => {
  const navigate = useNavigate();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeActionId, setActiveActionId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('Latest');

  const initialData = [
    { id: 1, name: 'Savannah Nguyen', accountType: 'Personal', dateJoined: 'Oct 24, 2026', status: 'Active', timestamp: 1729728000000, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120&h=120' },
    { id: 2, name: 'Annette Black', accountType: 'Personal', dateJoined: 'Oct 24, 2026', status: 'Active', timestamp: 1729814400000 },
    { id: 3, name: 'Robert Fox', accountType: 'Business', dateJoined: 'Oct 24, 2026', status: 'Offline', timestamp: 1729641600000, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120&h=120' },
    { id: 4, name: 'Ronald Richards', accountType: 'Business', dateJoined: 'Oct 24, 2026', status: 'Offline', timestamp: 1729555200000 },
    { id: 5, name: 'Brooklyn Simmons', accountType: 'Business', dateJoined: 'Oct 24, 2026', status: 'Offline', timestamp: 1729468800000, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120&h=120' },
    { id: 6, name: 'Devon Lane', accountType: 'Personal', dateJoined: 'Oct 24, 2026', status: 'Offline', timestamp: 1729382400000 },
    { id: 7, name: 'Jacob Jones', accountType: 'Personal', dateJoined: 'Oct 24, 2026', status: 'Active', timestamp: 1729296000000, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120&h=120' },
  ];

  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = [
      'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/30',
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30',
      'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 dark:border-rose-500/30',
      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 dark:border-amber-500/30',
      'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 dark:border-violet-500/30',
      'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 dark:border-cyan-500/30'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const filteredData = initialData
    .filter((item) => {
      if (statusFilter === 'All') return true;
      return item.status === statusFilter;
    })
    .sort((a, b) => {
      if (dateFilter === 'Latest') return b.timestamp - a.timestamp;
      return a.timestamp - b.timestamp;
    });

  const handleActionClick = (id) => {
    setActiveActionId(activeActionId === id ? null : id);
  };

  return (
    <div className="bg-white dark:bg-[#1E1E2D] rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800/80 overflow-hidden relative transition-colors">
      {/* Header */}
      <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-extrabold tracking-tight text-[#1A1A4B] dark:text-white transition-colors">
            Recent Mooment Onboarding
          </h2>
          <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-1.5 font-medium">
            Real-time people onboarding to your application
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] hover:border-[#454070] dark:hover:border-indigo-500 transition-all duration-300"
          >
            <Filter size={14} />
            Filter
          </button>

          <button 
            onClick={() => navigate('/user-management')}
            className="text-xs font-bold uppercase tracking-wider text-[#6D67E4] hover:text-[#4F46E5] dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
          >
            View All
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800/85">
              <th className="px-6 py-3.5 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3.5 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Account Type
              </th>
              <th className="px-6 py-3.5 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Date Joined
              </th>
              <th className="px-6 py-3.5 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Account Status
              </th>
              <th className="px-6 py-3.5 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
            {filteredData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/40 dark:hover:bg-[#2D2D3F]/35 transition-colors">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3.5">
                    {item.avatar ? (
                      <img 
                        src={item.avatar} 
                        alt={item.name} 
                        className="w-9 h-9 rounded-full object-cover border border-gray-150/40 dark:border-gray-800/80 transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-[12px] transition-transform duration-300 hover:scale-105 ${getAvatarColor(item.name)}`}>
                        {getInitials(item.name)}
                      </div>
                    )}
                    <span className="font-semibold text-gray-755 dark:text-gray-200 text-[14px] transition-colors">
                      {item.name}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-3">
                  <span className="text-gray-500 dark:text-gray-400 font-medium text-[14px]">
                    {item.accountType}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <span className="text-gray-500 dark:text-gray-400 font-medium text-[14px]">
                    {item.dateJoined}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${
                    item.status === 'Active'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/30'
                      : 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20 dark:border-slate-500/30'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      item.status === 'Active' 
                        ? 'bg-emerald-500 animate-pulse' 
                        : 'bg-slate-400 dark:bg-slate-500'
                    }`} />
                    {item.status}
                  </span>
                </td>

                <td className="px-6 py-3 text-center relative">
                  <button 
                    onClick={() => handleActionClick(item.id)}
                    className={`p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all ${
                      activeActionId === item.id ? 'bg-gray-55 dark:bg-gray-800 text-gray-600 dark:text-gray-200' : ''
                    }`}
                  >
                    <MoreVertical size={16} />
                  </button>

                  {/* Context-Preserving Dropdown Menu */}
                  {activeActionId === item.id && (
                    <>
                      {/* Click-away backdrop overlay */}
                      <div className="fixed inset-0 z-[80]" onClick={() => setActiveActionId(null)} />
                      
                      <div className="absolute right-6 top-11 z-[90] w-[140px] bg-white dark:bg-[#222235] border border-gray-150 dark:border-gray-800 rounded-2xl shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                        <button 
                          onClick={() => {
                            setActiveActionId(null);
                          }}
                          className="w-full px-4 py-2 text-[13px] font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/80 flex items-center gap-2.5 transition-colors"
                        >
                          <Eye size={14} className="text-gray-400 dark:text-gray-500" />
                          View
                        </button>
                        <button 
                          onClick={() => {
                            setActiveActionId(null);
                          }}
                          className="w-full px-4 py-2 text-[13px] font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/80 flex items-center gap-2.5 transition-colors"
                        >
                          <Edit2 size={14} className="text-gray-400 dark:text-gray-500" />
                          Edit
                        </button>
                        <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
                        <button 
                          onClick={() => {
                            setActiveActionId(null);
                          }}
                          className="w-full px-4 py-2 text-[13px] font-semibold text-rose-600 dark:text-rose-455 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#1E1E2D] rounded-[32px] w-full max-w-[440px] p-8 shadow-2xl border border-gray-100 dark:border-gray-800/40 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[20px] font-extrabold tracking-tight text-[#1A1A4B] dark:text-white transition-colors">
                Filter Onboardings
              </h3>
              <button 
                onClick={() => setIsFilterOpen(false)} 
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Status Section */}
            <div className="mb-6">
              <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] mb-3">
                STATUS
              </h4>
              <div className="flex gap-2.5">
                {['All', 'Active', 'Offline'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-5 py-2.5 rounded-xl border text-[13px] font-bold transition-all duration-300 ${
                      statusFilter === status
                        ? 'bg-[#454070] dark:bg-indigo-600 text-white border-[#454070] dark:border-indigo-600 shadow-md shadow-indigo-500/10'
                        : 'bg-transparent border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-[#454070] dark:hover:border-indigo-500 hover:text-[#454070] dark:hover:text-indigo-400'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Section */}
            <div className="mb-8">
              <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] mb-3">
                SORT BY DATE
              </h4>
              <div className="flex gap-2.5">
                {['Latest', 'Oldest'].map((date) => (
                  <button
                    key={date}
                    onClick={() => setDateFilter(date)}
                    className={`px-5 py-2.5 rounded-xl border text-[13px] font-bold transition-all duration-300 ${
                      dateFilter === date
                        ? 'bg-[#454070] dark:bg-indigo-600 text-white border-[#454070] dark:border-indigo-600 shadow-md shadow-indigo-500/10'
                        : 'bg-transparent border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-[#454070] dark:hover:border-indigo-500 hover:text-[#454070] dark:hover:text-indigo-400'
                    }`}
                  >
                    {date}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl text-[14px] font-bold hover:bg-gray-250 dark:hover:bg-gray-750 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="px-6 py-3 bg-[#454070] dark:bg-indigo-600 text-white rounded-2xl text-[14px] font-bold hover:bg-[#34305c] dark:hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/10"
              >
                Apply
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default RecentMoomentOnboarding;
