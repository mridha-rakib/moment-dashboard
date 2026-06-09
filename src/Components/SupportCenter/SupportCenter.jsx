import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MoreVertical, ChevronLeft, ChevronRight, ChevronDown, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { supportTicketService } from '@/features/support';
import { getApiErrorMessage } from '@/shared/api';

const itemsPerPage = 4;

const defaultPagination = {
  page: 1,
  limit: itemsPerPage,
  total: 0,
  totalPages: 0,
  from: 0,
  to: 0,
};

const statusLabels = {
  pending: 'Pending',
  solved: 'Solved',
  dismissed: 'Dismissed',
};

const statusValues = {
  Pending: 'pending',
  Solved: 'solved',
  Dismissed: 'dismissed',
};

const getAvatarUrl = (ticket) => (
  ticket.requester.avatarUrl || `https://i.pravatar.cc/150?u=${encodeURIComponent(ticket.requester.email || ticket.id)}`
);

const toTicketRow = (ticket) => ({
  id: ticket.id,
  user: {
    name: ticket.requester.name,
    email: ticket.requester.email,
    avatar: getAvatarUrl(ticket),
  },
  topic: ticket.title,
  status: statusLabels[ticket.status] || 'Pending',
  rawStatus: ticket.status,
});

const SupportCenter = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeStatusFilter, setActiveStatusFilter] = useState('Status');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState(defaultPagination);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [error, setError] = useState(null);

  const loadTickets = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const status = activeStatusFilter === 'Status' ? undefined : statusValues[activeStatusFilter];
      const result = await supportTicketService.listTickets({
        page: currentPage,
        limit: itemsPerPage,
        ...(searchTerm.trim() ? { search: searchTerm.trim() } : {}),
        ...(status ? { status } : {}),
      });

      setTickets(result.tickets);
      setPagination(result.pagination);
    } catch (loadError) {
      setTickets([]);
      setPagination(defaultPagination);
      setError(getApiErrorMessage(loadError, 'Unable to load support tickets.'));
    } finally {
      setIsLoading(false);
    }
  }, [activeStatusFilter, currentPage, searchTerm]);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  const totalPages = pagination.totalPages;
  const currentItems = tickets.map(toTicketRow);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleTicketStatusChange = async (status) => {
    if (!selectedTicket) return;

    setIsUpdatingStatus(true);

    try {
      await supportTicketService.updateStatus(selectedTicket.id, status);
      setIsActionModalOpen(false);
      setSelectedTicket(null);
      await loadTickets();
    } catch (statusError) {
      window.alert(getApiErrorMessage(statusError, 'Unable to update ticket status.'));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Solved': return 'bg-[#10B981]/10 text-[#10B981]';
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
              {['Status', 'Pending', 'Solved', 'Dismissed'].map((status) => (
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
                <th className="px-8 py-5 text-[12px] font-bold text-[#8E8EBC] uppercase tracking-widest">Buyer & Email</th>
                <th className="px-8 py-5 text-[12px] font-bold text-[#8E8EBC] uppercase tracking-widest">Topic</th>
                <th className="px-8 py-5 text-[12px] font-bold text-[#8E8EBC] uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[12px] font-bold text-[#8E8EBC] uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {isLoading && (
                <tr>
                  <td colSpan={4} className="px-8 py-8">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                      <Spinner className="size-4" />
                      Loading support tickets...
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && error && (
                <tr>
                  <td colSpan={4} className="px-8 py-8 text-sm font-bold text-red-500">
                    {error}
                  </td>
                </tr>
              )}

              {!isLoading && !error && currentItems.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-8 text-sm font-bold text-gray-400">
                    No support tickets found.
                  </td>
                </tr>
              )}

              {!isLoading && !error && currentItems.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50/50 dark:hover:bg-[#2D2D3F]/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <img src={ticket.user.avatar} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-[#1A1A4B] dark:text-white text-[15px] transition-colors">{ticket.user.name}</p>
                        <p className="text-[12px] text-gray-400">{ticket.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="font-bold text-[#1A1A4B] dark:text-gray-200 text-[15px] max-w-[300px] truncate transition-colors">{ticket.topic}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold ${getStatusStyle(ticket.status)} transition-all`}>
                      {ticket.status}
                    </span>
                  </td>

                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => {
                        setSelectedTicket(ticket);
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
            Showing {pagination.from}-{pagination.to} of {pagination.total} members
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
              <p className="text-[12px] font-bold text-gray-300 uppercase tracking-widest">ticket actions</p>
            </div>
            <div className="flex flex-col">
              <button 
                onClick={() => {
                  navigate(`/support-message/${selectedTicket.id}`);
                  setIsActionModalOpen(false);
                }}
                className="flex items-center gap-3 px-6 py-4 text-sm font-bold text-[#4B4B4B] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] hover:text-[#6D67E4] dark:hover:text-indigo-400 transition-all border-b border-gray-50 dark:border-gray-800"
              >
                <Eye size={18} className="text-gray-400" /> View Details
              </button>
              <button
                onClick={() => handleTicketStatusChange('solved')}
                disabled={isUpdatingStatus}
                className="flex items-center gap-3 px-6 py-4 text-sm font-bold text-[#10B981] hover:bg-[#10B981]/5 transition-all border-b border-gray-50 dark:border-gray-800 disabled:opacity-50"
              >
                <CheckCircle size={18} /> Mark as Solved
              </button>
              <button
                onClick={() => handleTicketStatusChange('dismissed')}
                disabled={isUpdatingStatus}
                className="flex items-center gap-3 px-6 py-4 text-sm font-bold text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] transition-all disabled:opacity-50"
              >
                <XCircle size={18} /> Dismiss Ticket
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SupportCenter;
