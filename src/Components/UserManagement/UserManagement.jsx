import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Users,
  CheckCircle,
  ShieldAlert,
  Eye,
  User,
  Briefcase,
  Filter,
  X,
  UserCheck,
  UserX,
  Building,
  Trash2
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { getApiErrorMessage } from '@/shared/api';
import { userManagementService } from '@/features/users';

const itemsPerPage = 4;

const defaultPagination = {
  page: 1,
  limit: itemsPerPage,
  total: 0,
  totalPages: 0,
  from: 0,
  to: 0,
};

const formatAccountType = (type) => {
  if (type === 'business') return 'Business';
  return 'Personal';
};

const formatDate = (value) => {
  if (!value) return 'N/A';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(date);
};

const getAvatarUrl = (user) => {
  if (user.avatarUrl) return user.avatarUrl;

  const initial = (user.name || '?').trim().charAt(0).toUpperCase() || '?';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="100%" height="100%" fill="#E8EBFD"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="#6D67E4" font-family="Arial" font-size="40" font-weight="700">${initial.replace(/[<>&"']/g, '')}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const toUserRow = (user) => {
  return {
    id: user.id,
    name: user.name || 'Unnamed user',
    email: user.email || 'No email',
    type: formatAccountType(user.accountType),
    date: formatDate(user.createdAt),
    status: user.isActive ? 'Active' : 'Suspended',
    isActive: user.isActive,
    avatar: getAvatarUrl(user),
    isDeleted: Boolean(user.isDeleted),
    totalEvents: Number(user.totalEvents) || 0,
    completedEvents: Number(user.completedEvents) || 0,
    cancelledEvents: Number(user.cancelledEvents) || 0,
  };
};

const UserManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(defaultPagination);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const requestIdRef = useRef(0);

  // Statistics counters
  const [stats, setStats] = useState({ total: 0, active: 0, suspended: 0, business: 0 });
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setIsStatsLoading(true);
    setError(null);

    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
      };

      if (statusFilter === 'active') params.isActive = true;
      if (statusFilter === 'suspended') params.isActive = false;
      if (typeFilter === 'personal') params.accountType = 'personal';
      if (typeFilter === 'business') params.accountType = 'business';

      const result = await userManagementService.listUsers(params);

      if (requestId !== requestIdRef.current) return;

      setUsers(result.users);
      setPagination(result.pagination);
      setStats(result.stats);
      if (result.pagination.totalPages > 0 && currentPage > result.pagination.totalPages) {
        setCurrentPage(result.pagination.totalPages);
      }
    } catch (loadError) {
      if (requestId !== requestIdRef.current) return;
      setUsers([]);
      setPagination(defaultPagination);
      setError(getApiErrorMessage(loadError, 'Unable to load users.'));
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
        setIsStatsLoading(false);
      }
    }
  }, [currentPage, debouncedSearch, statusFilter, typeFilter]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const totalPages = pagination.totalPages;
  const currentItems = useMemo(() => users.map(toUserRow), [users]);
  const visiblePages = useMemo(() => {
    const start = Math.max(1, Math.min(currentPage - 2, Math.max(totalPages - 4, 1)));
    return Array.from({ length: Math.min(totalPages, 5) }, (_, index) => start + index);
  }, [currentPage, totalPages]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const openActionModal = (user) => {
    setSelectedUser(user);
    setIsActionModalOpen(true);
  };

  const handleStatusToggle = async () => {
    if (!selectedUser) return;

    const previousUsers = users;
    const previousStats = stats;
    const nextIsActive = !selectedUser.isActive;
    setIsUpdatingStatus(true);
    setUsers((current) => current.map((user) => (
      user.id === selectedUser.id ? { ...user, isActive: nextIsActive } : user
    )));
    setStats((current) => ({
      ...current,
      active: Math.max(0, current.active + (nextIsActive ? 1 : -1)),
      suspended: Math.max(0, current.suspended + (nextIsActive ? -1 : 1)),
    }));
    setIsActionModalOpen(false);
    setSelectedUser(null);

    try {
      await userManagementService.updateUser(selectedUser.id, {
        isActive: nextIsActive,
      });
    } catch (statusError) {
      setUsers(previousUsers);
      setStats(previousStats);
      window.alert(getApiErrorMessage(statusError, 'Unable to update user status.'));
    } finally {
      setIsUpdatingStatus(false);
      await loadUsers();
    }
  };

  const handleDelete = async () => {
    if (!selectedUser || !window.confirm(`Delete ${selectedUser.name}'s account? Personal data will be anonymized.`)) return;

    const previousUsers = users;
    const previousStats = stats;
    setIsDeleting(true);
    setUsers((current) => current.filter((user) => user.id !== selectedUser.id));
    setPagination((current) => ({ ...current, total: Math.max(0, current.total - 1) }));
    setStats((current) => ({
      ...current,
      total: Math.max(0, current.total - 1),
      active: Math.max(0, current.active - (selectedUser.isActive ? 1 : 0)),
      suspended: Math.max(0, current.suspended - (selectedUser.isActive ? 0 : 1)),
      business: Math.max(0, current.business - (selectedUser.type === 'Business' ? 1 : 0)),
    }));
    setIsActionModalOpen(false);
    setSelectedUser(null);

    try {
      await userManagementService.deleteUser(selectedUser.id);
    } catch (deleteError) {
      setUsers(previousUsers);
      setStats(previousStats);
      window.alert(getApiErrorMessage(deleteError, 'Unable to delete user.'));
    } finally {
      setIsDeleting(false);
      await loadUsers();
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* 4-Column Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1: Total Platform Members */}
        <div className="bg-white dark:bg-[#1E1E2D] p-6 rounded-3xl border border-gray-100 dark:border-gray-800/40 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex justify-between items-center group">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Total Members</p>
            {isStatsLoading ? (
              <div className="h-9 w-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            ) : (
              <h2 className="text-3xl font-extrabold text-[#1A1A4B] dark:text-white transition-colors tracking-tight">
                {stats.total}
              </h2>
            )}
          </div>
          <div className="p-4 bg-indigo-500/10 dark:bg-indigo-500/20 text-[#6D67E4] dark:text-indigo-400 rounded-2xl group-hover:scale-105 transition-transform duration-300">
            <Users size={24} />
          </div>
        </div>

        {/* Metric 2: Active Accounts */}
        <div className="bg-white dark:bg-[#1E1E2D] p-6 rounded-3xl border border-gray-100 dark:border-gray-800/40 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex justify-between items-center group">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Active Accounts</p>
            {isStatsLoading ? (
              <div className="h-9 w-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            ) : (
              <h2 className="text-3xl font-extrabold text-[#1A1A4B] dark:text-white transition-colors tracking-tight">
                {stats.active}
              </h2>
            )}
          </div>
          <div className="p-4 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 rounded-2xl group-hover:scale-105 transition-transform duration-300">
            <UserCheck size={24} />
          </div>
        </div>

        {/* Metric 3: Suspended Accounts */}
        <div className="bg-white dark:bg-[#1E1E2D] p-6 rounded-3xl border border-gray-100 dark:border-gray-800/40 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex justify-between items-center group">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Suspended</p>
            {isStatsLoading ? (
              <div className="h-9 w-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            ) : (
              <h2 className="text-3xl font-extrabold text-[#1A1A4B] dark:text-white transition-colors tracking-tight">
                {stats.suspended}
              </h2>
            )}
          </div>
          <div className="p-4 bg-rose-500/10 dark:bg-rose-500/20 text-rose-500 dark:text-rose-400 rounded-2xl group-hover:scale-105 transition-transform duration-300">
            <UserX size={24} />
          </div>
        </div>

        {/* Metric 4: Business Accounts */}
        <div className="bg-white dark:bg-[#1E1E2D] p-6 rounded-3xl border border-gray-100 dark:border-gray-800/40 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex justify-between items-center group">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Business Tier</p>
            {isStatsLoading ? (
              <div className="h-9 w-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            ) : (
              <h2 className="text-3xl font-extrabold text-[#1A1A4B] dark:text-white transition-colors tracking-tight">
                {stats.business}
              </h2>
            )}
          </div>
          <div className="p-4 bg-blue-500/10 dark:bg-blue-500/20 text-blue-500 dark:text-blue-400 rounded-2xl group-hover:scale-105 transition-transform duration-300">
            <Building size={24} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-[#1E1E2D] rounded-[28px] shadow-sm border border-gray-100 dark:border-gray-850 overflow-hidden transition-all duration-300">
        
        {/* Filters Controls Panel */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800/60">
          
          {/* Status Tabs */}
          <div className="flex bg-[#F8F9FD] dark:bg-[#2D2D3F] p-1 rounded-2xl w-full lg:w-auto">
            {[
              { id: 'all', label: 'All Users' },
              { id: 'active', label: 'Active' },
              { id: 'suspended', label: 'Suspended' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id);
                  setCurrentPage(1);
                }}
                className={`flex-1 lg:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === tab.id
                    ? 'bg-white dark:bg-[#1E1E2D] text-[#6D67E4] dark:text-indigo-400 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search, Type Dropdown, Reset controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            {/* Search Box */}
            <div className="relative w-full sm:w-[260px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search name or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-11 pr-10 py-2.5 bg-[#F8F9FD] dark:bg-[#2D2D3F] border border-transparent rounded-2xl text-xs font-medium text-[#1A1A4B] dark:text-white focus:border-[#6D67E4]/40 focus:ring-1 focus:ring-[#6D67E4]/40 transition-all outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-250"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Account Type Selector */}
            <div className="relative w-full sm:w-auto">
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none w-full sm:w-auto pl-4 pr-10 py-2.5 bg-[#F8F9FD] dark:bg-[#2D2D3F] border border-transparent rounded-2xl text-xs font-bold text-gray-500 dark:text-gray-300 focus:border-[#6D67E4]/40 transition-all outline-none cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="personal">Personal</option>
                <option value="business">Business</option>
              </select>
              <Filter className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>

            {/* Reset Button */}
            {(statusFilter !== 'all' || typeFilter !== 'all' || searchTerm) && (
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setTypeFilter('all');
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Name</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Account Type</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Joining Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">Total Events</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">Completed Events</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">Cancelled Events</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Account Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading && (
                Array.from({ length: itemsPerPage }, (_, index) => (
                  <tr key={`skeleton-${index}`} className="animate-pulse">
                    <td className="px-8 py-5"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800" /><div className="space-y-2"><div className="h-3 w-28 rounded bg-gray-100 dark:bg-gray-800" /><div className="h-2.5 w-36 rounded bg-gray-100 dark:bg-gray-800" /></div></div></td>
                    {Array.from({ length: 7 }, (_, cellIndex) => <td key={cellIndex} className="px-8 py-5"><div className="h-3 w-16 mx-auto rounded bg-gray-100 dark:bg-gray-800" /></td>)}
                  </tr>
                ))
              )}

              {!isLoading && error && (
                <tr>
                  <td colSpan="8" className="px-8 py-14">
                    <div className="text-center text-xs font-bold text-red-500 space-y-3">
                      <p>{error}</p>
                      <button onClick={() => void loadUsers()} className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-colors">
                        Try Again
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && !error && currentItems.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-4">
                      <div className="p-4 bg-gray-50 dark:bg-[#2D2D3F] rounded-full text-gray-400 dark:text-gray-500">
                        <Users size={28} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#1A1A4B] dark:text-white">No users found</h4>
                        <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search query to find who you're looking for.</p>
                      </div>
                      {(statusFilter !== 'all' || typeFilter !== 'all' || searchTerm) && (
                        <button
                          onClick={() => {
                            setStatusFilter('all');
                            setTypeFilter('all');
                            setSearchTerm('');
                            setCurrentPage(1);
                          }}
                          className="px-4 py-2 text-xs font-bold text-[#6D67E4] dark:text-indigo-400 hover:underline"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && !error && currentItems.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-[#2D2D3F]/40 transition-colors duration-200">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = getAvatarUrl({ name: user.name });
                        }}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-50 dark:ring-gray-800/40"
                      />
                      <div>
                        <p className="font-bold text-[#1A1A4B] dark:text-white text-[14px] transition-colors leading-snug">{user.name}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5 font-medium">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="inline-flex items-center gap-2 font-bold text-[#4B4B4B] dark:text-gray-300 text-[13px] transition-colors">
                      {user.type === 'Business' ? (
                        <Briefcase size={14} className="text-indigo-400" />
                      ) : (
                        <User size={14} className="text-gray-400" />
                      )}
                      {user.type}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-medium text-[#4B4B4B] dark:text-gray-400 text-[13px] transition-colors">{user.date}</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="font-bold text-gray-700 dark:text-gray-200 text-[13px]">
                      {user.totalEvents}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="font-bold text-emerald-600 dark:text-emerald-450 text-[13px] bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                      {user.completedEvents}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="font-bold text-rose-600 dark:text-rose-450 text-[13px] bg-rose-50 dark:bg-rose-500/10 px-2.5 py-1 rounded-lg">
                      {user.cancelledEvents}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    {user.status === 'Active' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 rounded-full text-[11px] font-bold">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-500 dark:text-rose-400 rounded-full text-[11px] font-bold">
                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                        Suspended
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button
                      onClick={() => openActionModal(user)}
                      className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] transition-all"
                    >
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        {!isLoading && !error && currentItems.length > 0 && (
          <div className="px-8 py-6 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 transition-colors">
            <p className="text-[12px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
              Showing {pagination.from}-{pagination.to} of {pagination.total} members
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2.5 border border-gray-100 dark:border-gray-800 rounded-xl text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>

              {visiblePages.map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    currentPage === pageNumber
                      ? 'bg-[#E8EBFD] dark:bg-indigo-600/20 text-[#6D67E4] dark:text-indigo-400 shadow-sm'
                      : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2D2D3F]'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2.5 border border-gray-100 dark:border-gray-800 rounded-xl text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Premium Actions Context Modal */}
      {isActionModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Blur Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-md transition-opacity"
            onClick={() => setIsActionModalOpen(false)}
          ></div>

          {/* Modal Card */}
          <div className="relative bg-white dark:bg-[#1E1E2D] rounded-[32px] border border-gray-150 dark:border-gray-800 p-8 w-full max-w-[360px] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Top Close Button */}
            <button
              onClick={() => setIsActionModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Visual Identity Panel */}
            <div className="flex flex-col items-center text-center mt-2 mb-8">
              <img
                src={selectedUser.avatar}
                alt={selectedUser.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500/20 shadow-md mb-3"
              />
              <h3 className="text-lg font-bold text-[#1A1A4B] dark:text-white leading-tight">
                {selectedUser.name}
              </h3>
              <p className="text-xs text-gray-400 mt-1 mb-3.5 font-medium">
                {selectedUser.email}
              </p>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                selectedUser.status === 'Active'
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-rose-500/10 text-rose-500'
              }`}>
                <span className={`w-1.2 h-1.2 rounded-full ${selectedUser.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                {selectedUser.status}
              </span>
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {/* Option 1: View profile */}
              <button
                className="flex items-center justify-center gap-3 w-full py-3.5 bg-indigo-50 dark:bg-indigo-600/10 text-[#6D67E4] dark:text-indigo-400 font-bold text-xs rounded-2xl hover:bg-[#E8EBFD] dark:hover:bg-indigo-600/20 transition-all cursor-pointer"
                onClick={() => {
                  setIsActionModalOpen(false);
                  navigate(`/user-management/${selectedUser.id}`);
                }}
              >
                <Eye size={16} />
                View Details
              </button>

              {/* Option 2: Suspension toggle */}
              <button
                className={`flex items-center justify-center gap-3 w-full py-3.5 font-bold text-xs rounded-2xl transition-all border cursor-pointer ${
                  selectedUser?.isActive
                    ? 'bg-rose-500/10 border-rose-500/25 hover:bg-rose-500/20 text-rose-500 dark:border-rose-500/10'
                    : 'bg-emerald-500/10 border-emerald-500/25 hover:bg-emerald-500/20 text-emerald-500 dark:border-emerald-500/10'
                }`}
                disabled={isUpdatingStatus}
                onClick={handleStatusToggle}
              >
                {isUpdatingStatus ? (
                  <>
                    <Spinner className="size-4" />
                    Updating Status...
                  </>
                ) : selectedUser?.isActive ? (
                  <>
                    <ShieldAlert size={16} />
                    Suspend Account
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Activate Account
                  </>
                )}
              </button>

              <button
                className="flex items-center justify-center gap-3 w-full py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-300 font-bold text-xs rounded-2xl hover:bg-red-500/10 hover:border-red-500/25 hover:text-red-500 transition-all cursor-pointer"
                disabled={isDeleting || isUpdatingStatus}
                onClick={handleDelete}
              >
                {isDeleting ? <Spinner className="size-4" /> : <Trash2 size={16} />}
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
