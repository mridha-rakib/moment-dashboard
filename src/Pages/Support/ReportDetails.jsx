import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, MoreVertical, XCircle, Ban, Trash2, Hash, Layers } from 'lucide-react';

const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  const reportData = {
    id: '1235',
    count: '45',
    status: 'Pending',
    content: {
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=1924&auto=format&fit=crop',
      description: "Here's some totally pointless content that doesn't really say anything useful. It's just a bunch of words thrown together to fill space. Enjoy!"
    },
    reportedUser: {
      name: 'Leslie Alexander',
      username: '@username',
      avatar: 'https://i.pravatar.cc/150?u=leslie'
    },
    reports: [
      {
        by: { name: 'Arlene McCoy', username: '@username', avatar: 'https://i.pravatar.cc/150?u=arlene' },
        reason: { category: 'CONTENT VIOLATIONS', type: 'Inappropriate content' }
      },
      {
        by: { name: 'Cody Fisher', username: '@username', avatar: 'https://i.pravatar.cc/150?u=cody' },
        reason: { category: 'CONTENT VIOLATIONS', type: 'Inappropriate content' }
      },
      {
        by: { name: 'Kathryn Murphy', username: '@username', avatar: 'https://i.pravatar.cc/150?u=kathryn' },
        reason: { category: 'CONTENT VIOLATIONS', type: 'Inappropriate content' }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] dark:bg-[#13131F] p-8 transition-colors duration-300">
      <div className="mx-auto max-w-[1400px]">

        {/* Stats and Actions Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white dark:bg-[#1E1E2D] rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                <Hash className="text-[#1A1A4B] dark:text-white" size={20} />
              </div>
              <div>
                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Report ID</p>
                <p className="text-[16px] font-bold text-[#1A1A4B] dark:text-white transition-colors">{reportData.id}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white dark:bg-[#1E1E2D] rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                <Layers className="text-[#1A1A4B] dark:text-white" size={20} />
              </div>
              <div>
                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Report Count</p>
                <p className="text-[16px] font-bold text-[#1A1A4B] dark:text-white transition-colors">{reportData.count}</p>
              </div>
            </div>

          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setIsActionModalOpen(!isActionModalOpen)}
                className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-[#1E1E2D] border border-gray-100 dark:border-gray-800 rounded-xl text-gray-500 dark:text-gray-300 text-sm font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-[#2D2D3F] transition-all"
              >
                Action <ChevronDown size={16} />
              </button>

              
              {isActionModalOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1E1E2D] rounded-2xl shadow-xl border border-gray-50 dark:border-gray-800 z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <button className="w-full px-6 py-3 text-left text-[12px] font-bold text-[#4B4B4B] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] transition-all border-b border-gray-50 dark:border-gray-800">Remove Content</button>
                  <button className="w-full px-6 py-3 text-left text-[12px] font-bold text-[#4B4B4B] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] transition-all border-b border-gray-50 dark:border-gray-800">Banned User</button>
                  <button className="w-full px-6 py-3 text-left text-[12px] font-bold text-[#4B4B4B] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] transition-all border-b border-gray-50 dark:border-gray-800">Dismiss Report</button>
                  <button className="w-full px-6 py-3 text-left text-[12px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all">Delete</button>
                </div>
              )}

            </div>
            <button className="px-8 py-2.5 bg-gray-200/50 text-gray-500 text-sm font-bold rounded-xl hover:bg-gray-200 transition-all">
              Cancel
            </button>
            <button className="px-8 py-2.5 bg-[#6D67E4] text-white text-sm font-bold rounded-xl hover:bg-[#5B55C9] transition-all shadow-lg shadow-[#6D67E4]/20">
              Update
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: Reported Content */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-[#1A1A4B] dark:text-white transition-colors">Reported Content</h3>
            <div className="bg-white dark:bg-[#1E1E2D] rounded-[32px] p-6 shadow-sm border border-gray-50 dark:border-gray-800 space-y-6 transition-colors">
              <div className="aspect-[16/10] rounded-[24px] overflow-hidden">
                <img src={reportData.content.image} className="w-full h-full object-cover" />
              </div>
              <p className="text-[14px] leading-relaxed text-gray-400 font-medium">
                {reportData.content.description}
              </p>
            </div>
          </div>


          {/* Right Column: User and Reasons */}
          <div className="space-y-10">
            <div className="space-y-6">
              <span className="px-4 py-1.5 bg-[#FF9F43]/10 text-[#FF9F43] text-[11px] font-bold rounded-full uppercase tracking-wider">
                {reportData.status}
              </span>
              <div className="space-y-4">
                <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Reported User</h3>
                <div className="flex items-center gap-4 bg-white dark:bg-[#1E1E2D] p-4 rounded-2xl border border-gray-50 dark:border-gray-800 shadow-sm transition-colors">
                  <img src={reportData.reportedUser.avatar} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="font-bold text-[#1A1A4B] dark:text-white transition-colors">{reportData.reportedUser.name}</p>
                    <p className="text-sm text-gray-400">{reportData.reportedUser.username}</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Reporters List */}
            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {reportData.reports.map((report, index) => (
                <div key={index} className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="space-y-4">
                    <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Reported By</h3>
                    <div className="flex items-center gap-4 bg-white dark:bg-[#1E1E2D] p-4 rounded-2xl border border-gray-50 dark:border-gray-800 shadow-sm transition-colors">
                      <img src={report.by.avatar} className="w-12 h-12 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-[#1A1A4B] dark:text-white transition-colors">{report.by.name}</p>
                        <p className="text-sm text-gray-400">{report.by.username}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Reported Reason</h3>
                    <div className="bg-white dark:bg-[#1E1E2D] p-4 rounded-2xl border border-gray-50 dark:border-gray-800 shadow-sm h-full flex flex-col justify-center transition-colors">
                      <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">{report.reason.category}</p>
                      <p className="text-sm font-bold text-[#4B4B4B] dark:text-gray-300 transition-colors">{report.reason.type}</p>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetails;
