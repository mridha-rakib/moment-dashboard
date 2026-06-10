import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MoreVertical, ChevronLeft, ChevronRight, Users } from 'lucide-react';
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

const getAvatarUrl = (user) => (
  user.avatarUrl || `https://i.pravatar.cc/150?u=${encodeURIComponent(user.email || user.id)}`
);

const toUserRow = (user) => ({
  id: user.id,
  name: user.name || 'Unnamed user',
  email: user.email || 'No email',
  type: formatAccountType(user.accountType),
  date: formatDate(user.createdAt),
  status: user.isActive ? 'Active' : 'Suspended',
  isActive: user.isActive,
  avatar: getAvatarUrl(user),
});

const UserManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(defaultPagination);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [error, setError] = useState(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await userManagementService.listUsers({
        page: currentPage,
        limit: itemsPerPage,
        role: 'user',
        ...(searchTerm.trim() ? { search: searchTerm.trim() } : {}),
      });

      setUsers(result.users);
      setPagination(result.pagination);
    } catch (loadError) {
      setUsers([]);
      setPagination(defaultPagination);
      setError(getApiErrorMessage(loadError, 'Unable to load users.'));
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const totalPages = pagination.totalPages;
  const currentItems = useMemo(() => users.map(toUserRow), [users]);

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

    setIsUpdatingStatus(true);

    try {
      await userManagementService.updateUser(selectedUser.id, {
        isActive: !selectedUser.isActive,
      });
      setIsActionModalOpen(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (statusError) {
      window.alert(getApiErrorMessage(statusError, 'Unable to update user status.'));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-8 relative">
      <div className="bg-white dark:bg-[#1E1E2D] p-8 rounded-[24px] shadow-sm border border-gray-50 dark:border-gray-800 flex justify-between items-center max-w-full transition-colors">
        <div>
          <p className="text-[12px] font-bold text-[#8E8EBC] uppercase tracking-widest mb-2">TOTAL USER</p>
          <h2 className="text-[36px] font-bold text-[#1A1A4B] dark:text-white transition-colors">
            {pagination.total}
          </h2>
        </div>
        <div className="p-4 bg-[#602E7A1A] dark:bg-[#2D2D3F] rounded-2xl text-[#602E7A] transition-colors">
          <Users size={28} />
        </div>
      </div>

      <div className="bg-white dark:bg-[#1E1E2D] rounded-[24px] shadow-sm border border-gray-50 dark:border-gray-800 overflow-hidden transition-colors">
        <div className="p-6 flex justify-end">
          <div className="relative w-full max-w-[400px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search user by name, email, or username"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-12 pr-4 py-3 bg-[#F8F9FD] dark:bg-[#2D2D3F] border-none rounded-xl text-sm text-[#1A1A4B] dark:text-white focus:ring-2 focus:ring-[#6D67E4]/20 transition-all outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 dark:border-gray-800">
                <th className="px-8 py-5 text-[12px] font-bold text-[#8E8EBC] uppercase tracking-widest">Name</th>
                <th className="px-8 py-5 text-[12px] font-bold text-[#8E8EBC] uppercase tracking-widest">Account Type</th>
                <th className="px-8 py-5 text-[12px] font-bold text-[#8E8EBC] uppercase tracking-widest">Joining Date</th>
                <th className="px-8 py-5 text-[12px] font-bold text-[#8E8EBC] uppercase tracking-widest">Account Status</th>
                <th className="px-8 py-5 text-[12px] font-bold text-[#8E8EBC] uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {isLoading && (
                <tr>
                  <td colSpan="5" className="px-8 py-10">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                      <Spinner className="size-4" />
                      Loading users...
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && error && (
                <tr>
                  <td colSpan="5" className="px-8 py-10 text-sm font-bold text-red-500">
                    {error}
                  </td>
                </tr>
              )}

              {!isLoading && !error && currentItems.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-8 py-10 text-center text-gray-400 font-medium">
                    No users found matching your search.
                  </td>
                </tr>
              )}

              {!isLoading && !error && currentItems.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-[#2D2D3F]/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-[#1A1A4B] dark:text-white text-[15px] transition-colors">{user.name}</p>
                        <p className="text-[12px] text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-bold text-[#4B4B4B] dark:text-gray-300 text-[14px] transition-colors">{user.type}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-medium text-[#4B4B4B] dark:text-gray-400 text-[14px] transition-colors">{user.date}</span>
                  </td>

                  <td className="px-8 py-5">
                    {user.status === 'Active' ? (
                      <span className="px-4 py-1.5 bg-[#10B981] text-white rounded-lg text-[11px] font-bold uppercase tracking-wider">
                        Active
                      </span>
                    ) : (
                      <span className="px-4 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-[11px] font-bold uppercase tracking-wider">
                        Suspended
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button
                      onClick={() => openActionModal(user)}
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
                className={`w-9 h-9 flex items-center justify-center rounded-lg font-bold text-sm transition-all ${currentPage === i + 1
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

      {isActionModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm"
            onClick={() => setIsActionModalOpen(false)}
          ></div>
          <div className="relative bg-white dark:bg-[#1E1E2D] rounded-3xl p-8 w-full max-w-[320px] shadow-2xl animate-in fade-in zoom-in duration-200">
            <p className="text-[14px] text-gray-400 font-medium mb-6">more option</p>
            <div className="space-y-6 text-center">
              <button
                className="block w-full text-[28px] font-bold text-[#1A1A4B] dark:text-white hover:text-[#6D67E4] dark:hover:text-indigo-400 transition-colors"
                onClick={() => {
                  setIsActionModalOpen(false);
                  navigate(`/user-management/${selectedUser.id}`);
                }}
              >
                View
              </button>
              <button
                className="block w-full text-[28px] font-bold text-[#1A1A4B] dark:text-white hover:text-red-500 disabled:opacity-50 transition-colors"
                disabled={isUpdatingStatus}
                onClick={handleStatusToggle}
              >
                {isUpdatingStatus ? 'Updating...' : selectedUser?.isActive ? 'Suspend' : 'Activate'}
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default UserManagement;
