import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MoreVertical, ChevronLeft, ChevronRight, ChevronDown, Trash2, Eye, ShieldAlert, UserMinus, XCircle } from 'lucide-react';

const Report = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeStatusFilter, setActiveStatusFilter] = useState('Status');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isViolationModalOpen, setIsViolationModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  
  const itemsPerPage = 4;

  const reportData = useMemo(() => [
    { id: 1, reportBy: { name: 'Theresa Webb', email: 'bill.sanders@example.com', avatar: 'https://i.pravatar.cc/150?u=theresa' }, reportedUser: { name: 'Theresa Webb', email: 'bill.sanders@example.com', avatar: 'https://i.pravatar.cc/150?u=theresa' }, type: 'Post', status: 'Resolved' },
    { id: 2, reportBy: { name: 'Marvin McKinney', email: 'tim.jennings@example.com', avatar: 'https://i.pravatar.cc/150?u=marvin' }, reportedUser: { name: 'Marvin McKinney', email: 'tim.jennings@example.com', avatar: 'https://i.pravatar.cc/150?u=marvin' }, type: 'Event', status: 'Dismissed' },
    { id: 3, reportBy: { name: 'Courtney Henry', email: 'georgia.young@example.com', avatar: 'https://i.pravatar.cc/150?u=courtney' }, reportedUser: { name: 'Courtney Henry', email: 'georgia.young@example.com', avatar: 'https://i.pravatar.cc/150?u=courtney' }, type: 'User', status: 'Pending' },
    { id: 4, reportBy: { name: 'Steve Herd', email: 'sarah.c@vesioh.com', avatar: 'https://i.pravatar.cc/150?u=steve' }, reportedUser: { name: 'Steve Herd', email: 'sarah.c@vesioh.com', avatar: 'https://i.pravatar.cc/150?u=steve' }, type: 'Room', status: 'Pending' },
    { id: 5, reportBy: { name: 'Jane Cooper', email: 'jane.cooper@example.com', avatar: 'https://i.pravatar.cc/150?u=jane' }, reportedUser: { name: 'Jane Cooper', email: 'jane.cooper@example.com', avatar: 'https://i.pravatar.cc/150?u=jane' }, type: 'Post', status: 'Resolved' },
    { id: 6, reportBy: { name: 'Cody Fisher', email: 'cody.fisher@example.com', avatar: 'https://i.pravatar.cc/150?u=cody' }, reportedUser: { name: 'Cody Fisher', email: 'cody.fisher@example.com', avatar: 'https://i.pravatar.cc/150?u=cody' }, type: 'User', status: 'Pending' },
    { id: 7, reportBy: { name: 'Esther Howard', email: 'esther.howard@example.com', avatar: 'https://i.pravatar.cc/150?u=esther' }, reportedUser: { name: 'Esther Howard', email: 'esther.howard@example.com', avatar: 'https://i.pravatar.cc/150?u=esther' }, type: 'Event', status: 'Dismissed' },
    { id: 8, reportBy: { name: 'Jenny Wilson', email: 'jenny.wilson@example.com', avatar: 'https://i.pravatar.cc/150?u=jenny' }, reportedUser: { name: 'Jenny Wilson', email: 'jenny.wilson@example.com', avatar: 'https://i.pravatar.cc/150?u=jenny' }, type: 'Post', status: 'Pending' },
  ], []);

  const filteredData = useMemo(() => {
    return reportData.filter(report => {
      const matchesSearch = report.reportBy.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           report.reportedUser.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = activeStatusFilter === 'Status' || report.status === activeStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, activeStatusFilter, reportData]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  
  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredData.slice(indexOfFirstItem, indexOfLastItem);
  }, [currentPage, filteredData]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Resolved': return 'bg-[#10B981]/10 text-[#10B981]';
      case 'Dismissed': return 'bg-gray-100 text-gray-400';
      case 'Pending': return 'bg-[#FF9F43]/10 text-[#FF9F43]';
      default: return 'bg-gray-100 text-gray-400';
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Top Filter Bar */}
      <div className="flex justify-end items-center gap-4">
        <div className="relative w-full max-w-[400px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search user by name or company name"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#1E1E2D] border-none rounded-2xl text-sm text-[#1A1A4B] dark:text-white shadow-sm outline-none focus:ring-2 focus:ring-[#6D67E4]/20 transition-all"
          />
        </div>

        
        <div className="relative">
          <button 
            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
            className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-[#1E1E2D] rounded-2xl text-sm font-bold text-[#1A1A4B] dark:text-white shadow-sm hover:bg-gray-50 dark:hover:bg-[#2D2D3F] transition-all border border-gray-50 dark:border-gray-800"
          >
            {activeStatusFilter} <ChevronDown size={16} />
          </button>

          
          {isStatusDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#1E1E2D] rounded-2xl shadow-xl border border-gray-50 dark:border-gray-800 z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {['Status', 'Pending', 'Resolved', 'Dismissed'].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setActiveStatusFilter(status);
                    setCurrentPage(1);
                    setIsStatusDropdownOpen(false);
                  }}
                  className="w-full px-6 py-3 text-left text-sm font-bold text-[#4B4B4B] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] hover:text-[#6D67E4] dark:hover:text-indigo-400 transition-all border-b border-gray-50 dark:border-gray-800 last:border-0"
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>


      {/* Table Section */}
      <div className="bg-white dark:bg-[#1E1E2D] rounded-[24px] shadow-sm border border-gray-50 dark:border-gray-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 dark:border-gray-800 bg-[#FBFBFF]/50 dark:bg-[#2D2D3F]/50">
                <th className="px-8 py-5 text-[12px] font-bold text-[#8E8EBC] uppercase tracking-widest">Report by</th>
                <th className="px-8 py-5 text-[12px] font-bold text-[#8E8EBC] uppercase tracking-widest">Reported user</th>
                <th className="px-8 py-5 text-[12px] font-bold text-[#8E8EBC] uppercase tracking-widest">Type</th>
                <th className="px-8 py-5 text-[12px] font-bold text-[#8E8EBC] uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[12px] font-bold text-[#8E8EBC] uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">

              {currentItems.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50/50 dark:hover:bg-[#2D2D3F]/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <img src={report.reportBy.avatar} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-[#1A1A4B] dark:text-white text-[15px] transition-colors">{report.reportBy.name}</p>
                        <p className="text-[12px] text-gray-400">{report.reportBy.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <img src={report.reportedUser.avatar} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-[#1A1A4B] dark:text-white text-[15px] transition-colors">{report.reportedUser.name}</p>
                        <p className="text-[12px] text-gray-400">{report.reportedUser.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-bold text-[#1A1A4B] dark:text-gray-200 text-[15px] transition-colors">{report.type}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold ${getStatusStyle(report.status)} transition-all`}>
                      {report.status}
                    </span>
                  </td>

                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => {
                        setSelectedReport(report);
                        setIsActionModalOpen(true);
                      }}
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

        <div className="px-8 py-6 flex items-center justify-between border-t border-gray-50 dark:border-gray-800 transition-colors">
          <p className="text-[12px] text-gray-400 font-medium">
            Showing {filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
            {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} members
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border border-gray-100 dark:border-gray-800 rounded-lg text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={18} />
            </button>

            
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`w-9 h-9 flex items-center justify-center rounded-lg font-bold text-sm transition-all ${
                  currentPage === i + 1
                    ? 'bg-[#E8EBFD] dark:bg-indigo-600/20 text-[#6D67E4] dark:text-indigo-400'
                    : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2D2D3F]'
                }`}
              >
                {i + 1}
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
      </div>

      {/* Action Details Modal */}
      {isActionModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsActionModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-[#1E1E2D] rounded-[32px] shadow-2xl w-full max-w-[280px] overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-50 dark:border-gray-800 transition-colors">
              <p className="text-[12px] font-bold text-gray-300 uppercase tracking-widest">action details</p>
            </div>
            <div className="flex flex-col">
              <button 
                onClick={() => { 
                  navigate(`/report-details/${selectedReport.id}`);
                  setIsActionModalOpen(false); 
                }}
                className="flex items-center gap-3 px-6 py-4 text-sm font-bold text-[#4B4B4B] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] hover:text-[#6D67E4] dark:hover:text-indigo-400 transition-all border-b border-gray-50 dark:border-gray-800"
              >
                <Eye size={18} className="text-gray-400" /> View
              </button>
              <button className="flex items-center gap-3 px-6 py-4 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all border-b border-gray-50 dark:border-gray-800">
                <Trash2 size={18} /> Delete
              </button>
              <div className="px-6 py-3 bg-gray-50/50 dark:bg-[#2D2D3F]/50">
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">ACTION</p>
              </div>
              <button className="flex items-center gap-3 px-6 py-4 text-sm font-bold text-[#4B4B4B] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] transition-all border-b border-gray-50 dark:border-gray-800">
                <XCircle size={18} className="text-gray-400" /> Remove Content
              </button>
              <button className="flex items-center gap-3 px-6 py-4 text-sm font-bold text-[#4B4B4B] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] transition-all border-b border-gray-50 dark:border-gray-800">
                <ShieldAlert size={18} className="text-gray-400" /> Warn User
              </button>
              <button className="flex items-center gap-3 px-6 py-4 text-sm font-bold text-[#4B4B4B] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] transition-all">
                <UserMinus size={18} className="text-gray-400" /> Dismiss Report
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Violation Dropdown Modal */}
      {isViolationModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsViolationModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-[#1E1E2D] rounded-[32px] shadow-2xl w-full max-w-[320px] overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center transition-colors">
              <p className="text-[12px] font-bold text-gray-300 uppercase tracking-widest">violation dropdown</p>
              <button onClick={() => setIsViolationModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <XCircle size={20} />
              </button>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              <div className="space-y-1">
                <div className="px-6 py-3 bg-[#FBFBFF] dark:bg-[#2D2D3F] transition-colors"><p className="text-[10px] font-bold text-[#8E8EBC] uppercase tracking-widest">CONTENT VIOLATIONS</p></div>
                {['Inappropriate content', 'Sexually abusive', 'Nudity', 'Misinformation', 'Other'].map(v => (
                  <button key={v} className="w-full px-8 py-3 text-left text-sm font-medium text-[#4B4B4B] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] hover:text-[#6D67E4] dark:hover:text-indigo-400 transition-all">{v}</button>
                ))}
                
                <div className="px-6 py-3 bg-[#FBFBFF] dark:bg-[#2D2D3F] border-t border-gray-50 dark:border-gray-800 transition-colors"><p className="text-[10px] font-bold text-[#8E8EBC] uppercase tracking-widest">BEHAVIORAL VIOLATIONS</p></div>
                {['Abusive language', 'Harassment', 'Spam'].map(v => (
                  <button key={v} className="w-full px-8 py-3 text-left text-sm font-medium text-[#4B4B4B] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] hover:text-[#6D67E4] dark:hover:text-indigo-400 transition-all">{v}</button>
                ))}

                <div className="px-6 py-3 bg-[#FBFBFF] dark:bg-[#2D2D3F] border-t border-gray-50 dark:border-gray-800 transition-colors"><p className="text-[10px] font-bold text-[#8E8EBC] uppercase tracking-widest">POLICY & LEGAL VIOLATIONS</p></div>
                {['Animal cruelty', 'Impersonation', 'Copyright infringement'].map(v => (
                  <button key={v} className="w-full px-8 py-3 text-left text-sm font-medium text-[#4B4B4B] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] hover:text-[#6D67E4] dark:hover:text-indigo-400 transition-all">{v}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Report;
