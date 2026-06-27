import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, Hash, Layers } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { reportService } from '@/features/reports';
import { getApiErrorMessage } from '@/shared/api';

const titleCase = (value) => value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : 'Unknown';
const avatarFor = (user) => {
  if (user?.avatarUrl) return user.avatarUrl;
  const initial = (user?.name || '?').charAt(0).toUpperCase().replace(/[<>&"']/g, '') || '?';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="100%" height="100%" fill="#E8EBFD"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="#6D67E4" font-family="Arial" font-size="40" font-weight="700">${initial}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const loadReport = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try { setDetail(await reportService.get(id)); }
    catch (loadError) { setDetail(null); setError(getApiErrorMessage(loadError, 'Unable to load report details.')); }
    finally { setIsLoading(false); }
  }, [id]);

  useEffect(() => { void loadReport(); }, [loadReport]);

  const reportData = useMemo(() => detail ? {
    id: detail.report.id,
    count: detail.relatedReports.length,
    status: titleCase(detail.report.status),
    targetType: detail.report.targetType,
    content: { image: detail.report.content.imageUrl, description: detail.report.content.description || detail.report.content.title || 'No content description available.' },
    reportedUser: { ...detail.report.reportedUser, username: detail.report.reportedUser.email, avatar: avatarFor(detail.report.reportedUser) },
    reports: detail.relatedReports.map((report) => ({
      by: { ...report.reporter, username: report.reporter.email, avatar: avatarFor(report.reporter) },
      reason: { category: `${titleCase(report.targetType)} report`, type: report.reason },
    })),
  } : null, [detail]);

  const handleAction = async (action) => {
    if (!id) return;
    setIsUpdating(true);
    try {
      await reportService.action(id, action);
      setIsActionModalOpen(false);
      await loadReport();
    } catch (actionError) { window.alert(getApiErrorMessage(actionError, 'Unable to complete the report action.')); }
    finally { setIsUpdating(false); }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Delete this report record?')) return;
    setIsUpdating(true);
    try { await reportService.delete(id); navigate('/report'); }
    catch (deleteError) { window.alert(getApiErrorMessage(deleteError, 'Unable to delete the report.')); setIsUpdating(false); }
  };

  if (isLoading) return <div className="min-h-[400px] flex items-center justify-center"><Spinner className="size-6 text-[#6D67E4]" /></div>;
  if (error || !reportData) return <div className="min-h-[400px] flex flex-col items-center justify-center"><p className="text-sm font-bold text-red-500 mb-4">{error || 'Report not found.'}</p><button onClick={() => void loadReport()} className="px-4 py-2 rounded-xl text-xs font-bold text-red-500 bg-red-500/10">Try Again</button></div>;

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
                  <button disabled={reportData.targetType === 'user' || isUpdating} onClick={() => void handleAction('remove_content')} className="w-full px-6 py-3 text-left text-[12px] font-bold text-[#4B4B4B] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] transition-all border-b border-gray-50 dark:border-gray-800 disabled:opacity-40">Remove Content</button>
                  <button disabled={isUpdating} onClick={() => void handleAction('suspend_user')} className="w-full px-6 py-3 text-left text-[12px] font-bold text-[#4B4B4B] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] transition-all border-b border-gray-50 dark:border-gray-800 disabled:opacity-40">Banned User</button>
                  <button disabled={isUpdating} onClick={() => void handleAction('dismiss')} className="w-full px-6 py-3 text-left text-[12px] font-bold text-[#4B4B4B] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] transition-all border-b border-gray-50 dark:border-gray-800 disabled:opacity-40">Dismiss Report</button>
                  <button disabled={isUpdating} onClick={handleDelete} className="w-full px-6 py-3 text-left text-[12px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all disabled:opacity-40">Delete</button>
                </div>
              )}

            </div>
            <button onClick={() => navigate('/report')} className="px-8 py-2.5 bg-gray-200/50 text-gray-500 text-sm font-bold rounded-xl hover:bg-gray-200 transition-all">
              Cancel
            </button>
            <button disabled={isUpdating} onClick={() => void loadReport()} className="px-8 py-2.5 bg-[#6D67E4] text-white text-sm font-bold rounded-xl hover:bg-[#5B55C9] transition-all shadow-lg shadow-[#6D67E4]/20 disabled:opacity-50">
              Update
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: Reported Content */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-[#1A1A4B] dark:text-white transition-colors">Reported Content</h3>
            <div className="bg-white dark:bg-[#1E1E2D] rounded-[32px] p-6 shadow-sm border border-gray-50 dark:border-gray-800 space-y-6 transition-colors">
              {reportData.content.image && <div className="aspect-[16/10] rounded-[24px] overflow-hidden">
                <img src={reportData.content.image} alt="Reported content" className="w-full h-full object-cover" />
              </div>}
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
                  <img src={reportData.reportedUser.avatar} alt={reportData.reportedUser.name} className="w-12 h-12 rounded-full object-cover" />
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
                      <img src={report.by.avatar} alt={report.by.name} className="w-12 h-12 rounded-full object-cover" />
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
