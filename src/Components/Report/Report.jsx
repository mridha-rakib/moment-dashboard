import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MoreVertical, ChevronLeft, ChevronRight, ChevronDown, Trash2, Eye, ShieldAlert, UserMinus, XCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { reportService } from '@/features/reports';
import { getApiErrorMessage } from '@/shared/api';

const itemsPerPage = 4;
const emptyPagination = { page: 1, limit: itemsPerPage, total: 0, totalPages: 0, from: 0, to: 0 };
const titleCase = (value) => value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : 'Unknown';
const avatarFor = (user) => {
  if (user?.avatarUrl) return user.avatarUrl;
  const initial = (user?.name || '?').charAt(0).toUpperCase().replace(/[<>&"']/g, '') || '?';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="100%" height="100%" fill="#E8EBFD"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="#6D67E4" font-family="Arial" font-size="40" font-weight="700">${initial}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const toRow = (report) => ({
  ...report,
  reportBy: { ...report.reporter, avatar: avatarFor(report.reporter) },
  reportedUser: { ...report.reportedUser, avatar: avatarFor(report.reportedUser) },
  type: titleCase(report.targetType),
  status: titleCase(report.status),
});

const Report = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeStatusFilter, setActiveStatusFilter] = useState('Status');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isViolationModalOpen, setIsViolationModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState(emptyPagination);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const requestIdRef = useRef(0);

  const loadReports = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);
    try {
      const result = await reportService.list({
        page: currentPage,
        limit: itemsPerPage,
        ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
        ...(activeStatusFilter !== 'Status' ? { status: activeStatusFilter.toLowerCase() } : {}),
      });
      if (requestId !== requestIdRef.current) return;
      setReports(result.reports);
      setPagination(result.pagination);
      if (result.pagination.totalPages > 0 && currentPage > result.pagination.totalPages) setCurrentPage(result.pagination.totalPages);
    } catch (loadError) {
      if (requestId !== requestIdRef.current) return;
      setReports([]);
      setPagination(emptyPagination);
      setError(getApiErrorMessage(loadError, 'Unable to load reports.'));
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, [activeStatusFilter, currentPage, debouncedSearch]);

  useEffect(() => { void loadReports(); }, [loadReports]);
  useEffect(() => {
    const timeout = window.setTimeout(() => { setDebouncedSearch(searchTerm); setCurrentPage(1); }, 350);
    return () => window.clearTimeout(timeout);
  }, [searchTerm]);

  const totalPages = pagination.totalPages;
  const currentItems = useMemo(() => reports.map(toRow), [reports]);
  const visiblePages = useMemo(() => {
    const start = Math.max(1, Math.min(currentPage - 2, Math.max(totalPages - 4, 1)));
    return Array.from({ length: Math.min(totalPages, 5) }, (_, index) => start + index);
  }, [currentPage, totalPages]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleAction = async (action) => {
    if (!selectedReport) return;
    const previous = reports;
    const nextStatus = action === 'dismiss' ? 'dismissed' : 'resolved';
    setIsActionLoading(true);
    setReports((items) => items.map((item) => item.id === selectedReport.id ? { ...item, status: nextStatus, resolutionAction: action } : item));
    setIsActionModalOpen(false);
    try {
      await reportService.action(selectedReport.id, action);
    } catch (actionError) {
      setReports(previous);
      window.alert(getApiErrorMessage(actionError, 'Unable to complete the report action.'));
    } finally {
      setSelectedReport(null);
      setIsActionLoading(false);
      await loadReports();
    }
  };

  const handleDelete = async () => {
    if (!selectedReport || !window.confirm('Delete this report record?')) return;
    const previous = reports;
    setIsActionLoading(true);
    setReports((items) => items.filter((item) => item.id !== selectedReport.id));
    setIsActionModalOpen(false);
    try {
      await reportService.delete(selectedReport.id);
    } catch (deleteError) {
      setReports(previous);
      window.alert(getApiErrorMessage(deleteError, 'Unable to delete the report.'));
    } finally {
      setSelectedReport(null);
      setIsActionLoading(false);
      await loadReports();
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

              {isLoading && Array.from({ length: itemsPerPage }, (_, index) => (
                <tr key={`report-skeleton-${index}`} className="animate-pulse">
                  {[0, 1].map((cell) => <td key={cell} className="px-8 py-5"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800" /><div className="space-y-2"><div className="h-3 w-28 bg-gray-100 dark:bg-gray-800 rounded" /><div className="h-2.5 w-36 bg-gray-100 dark:bg-gray-800 rounded" /></div></div></td>)}
                  {[0, 1, 2].map((cell) => <td key={cell} className="px-8 py-5"><div className="h-3 w-16 ml-auto bg-gray-100 dark:bg-gray-800 rounded" /></td>)}
                </tr>
              ))}

              {!isLoading && error && (
                <tr><td colSpan="5" className="px-8 py-16 text-center"><p className="text-sm font-bold text-red-500 mb-3">{error}</p><button onClick={() => void loadReports()} className="px-4 py-2 text-xs font-bold text-red-500 bg-red-500/10 rounded-xl hover:bg-red-500/20">Try Again</button></td></tr>
              )}

              {!isLoading && !error && currentItems.length === 0 && (
                <tr><td colSpan="5" className="px-8 py-16 text-center"><p className="text-sm font-bold text-[#1A1A4B] dark:text-white">No reports found</p><p className="text-xs text-gray-400 mt-1">Try adjusting the search or status filter.</p></td></tr>
              )}

              {!isLoading && !error && currentItems.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50/50 dark:hover:bg-[#2D2D3F]/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <img src={report.reportBy.avatar} alt={report.reportBy.name} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-[#1A1A4B] dark:text-white text-[15px] transition-colors">{report.reportBy.name}</p>
                        <p className="text-[12px] text-gray-400">{report.reportBy.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <img src={report.reportedUser.avatar} alt={report.reportedUser.name} className="w-10 h-10 rounded-full object-cover" />
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

        {!isLoading && !error && currentItems.length > 0 && <div className="px-8 py-6 flex items-center justify-between border-t border-gray-50 dark:border-gray-800 transition-colors">
          <p className="text-[12px] text-gray-400 font-medium">
            Showing {pagination.from}-{pagination.to} of {pagination.total} reports
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
        </div>}
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
              <button disabled={isActionLoading} onClick={handleDelete} className="flex items-center gap-3 px-6 py-4 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all border-b border-gray-50 dark:border-gray-800 disabled:opacity-50">
                {isActionLoading ? <Spinner className="size-4" /> : <Trash2 size={18} />} Delete
              </button>
              <div className="px-6 py-3 bg-gray-50/50 dark:bg-[#2D2D3F]/50">
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">ACTION</p>
              </div>
              <button disabled={selectedReport?.targetType === 'user' || isActionLoading} onClick={() => void handleAction('remove_content')} className="flex items-center gap-3 px-6 py-4 text-sm font-bold text-[#4B4B4B] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] transition-all border-b border-gray-50 dark:border-gray-800 disabled:opacity-40">
                <XCircle size={18} className="text-gray-400" /> Remove Content
              </button>
              <button disabled={isActionLoading} onClick={() => void handleAction('warn')} className="flex items-center gap-3 px-6 py-4 text-sm font-bold text-[#4B4B4B] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] transition-all border-b border-gray-50 dark:border-gray-800 disabled:opacity-40">
                <ShieldAlert size={18} className="text-gray-400" /> Warn User
              </button>
              <button disabled={isActionLoading} onClick={() => void handleAction('dismiss')} className="flex items-center gap-3 px-6 py-4 text-sm font-bold text-[#4B4B4B] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] transition-all disabled:opacity-40">
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
