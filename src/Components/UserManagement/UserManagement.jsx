import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MoreVertical, ChevronLeft, ChevronRight, Users } from 'lucide-react';

const UserManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const itemsPerPage = 4;

  const userData = useMemo(() => [
    { id: 1, name: 'Theresa Webb', email: 'bill.sanders@example.com', type: 'Personal', date: 'Oct 12, 2026', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=theresa' },
    { id: 2, name: 'Marvin McKinney', email: 'tim.jennings@example.com', type: 'Personal', date: 'Oct 12, 2026', status: 'Offline', avatar: 'https://i.pravatar.cc/150?u=marvin' },
    { id: 3, name: 'Courtney Henry', email: 'georgia.young@example.com', type: 'Business', date: 'Oct 12, 2026', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=courtney' },
    { id: 4, name: 'Steve Herd', email: 'sarah.c@webion.com', type: 'Business', date: 'Oct 12, 2028', status: 'Offline', avatar: 'https://i.pravatar.cc/150?u=steve' },
    { id: 5, name: 'Jane Cooper', email: 'jane.cooper@example.com', type: 'Personal', date: 'Nov 15, 2026', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=jane' },
    { id: 6, name: 'Cody Fisher', email: 'cody.fisher@example.com', type: 'Business', date: 'Dec 01, 2026', status: 'Offline', avatar: 'https://i.pravatar.cc/150?u=cody' },
    { id: 7, name: 'Esther Howard', email: 'esther.howard@example.com', type: 'Personal', date: 'Jan 20, 2027', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=esther' },
    { id: 8, name: 'Jenny Wilson', email: 'jenny.wilson@example.com', type: 'Business', date: 'Feb 10, 2027', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=jenny' },
  ], []);

  // Filter and Paginate logic
  const filteredData = useMemo(() => {
    return userData.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, userData]);

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

  const openActionModal = (user) => {
    setSelectedUser(user);
    setIsActionModalOpen(true);
  };

  return (
    <div className="space-y-8 relative">
      {/* Total User Card */}
      <div className="bg-white dark:bg-[#1E1E2D] p-8 rounded-[24px] shadow-sm border border-gray-50 dark:border-gray-800 flex justify-between items-center max-w-full transition-colors">
        <div>
          <p className="text-[12px] font-bold text-[#8E8EBC] uppercase tracking-widest mb-2">TOTAL USER</p>
          <h2 className="text-[36px] font-bold text-[#1A1A4B] dark:text-white transition-colors">{userData.length}</h2>
        </div>
        <div className="p-4 bg-[#602E7A1A] dark:bg-[#2D2D3F] rounded-2xl text-[#8E8EBC] transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 8C15 9.65685 13.6569 11 12 11C10.3431 11 9 9.65685 9 8C9 6.34315 10.3431 5 12 5C13.6569 5 15 6.34315 15 8Z" stroke="#602E7A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 4C17.6569 4 19 5.34315 19 7C19 8.22309 18.2681 9.27523 17.2183 9.7423" stroke="#602E7A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M13.7143 14H10.2857C7.91878 14 6 15.9188 6 18.2857C6 19.2325 6.76751 20 7.71428 20H16.2857C17.2325 20 18 19.2325 18 18.2857C18 15.9188 16.0812 14 13.7143 14Z" stroke="#602E7A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M17.7144 13C20.0813 13 22.0001 14.9188 22.0001 17.2857C22.0001 18.2325 21.2326 19 20.2858 19" stroke="#602E7A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 4C6.34315 4 5 5.34315 5 7C5 8.22309 5.73193 9.27523 6.78168 9.7423" stroke="#602E7A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3.71429 19C2.76751 19 2 18.2325 2 17.2857C2 14.9188 3.91878 13 6.28571 13" stroke="#602E7A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>


      {/* Search and Table Section */}
      <div className="bg-white dark:bg-[#1E1E2D] rounded-[24px] shadow-sm border border-gray-50 dark:border-gray-800 overflow-hidden transition-colors">
        {/* Search Bar */}
        <div className="p-6 flex justify-end">
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
              className="w-full pl-12 pr-4 py-3 bg-[#F8F9FD] dark:bg-[#2D2D3F] border-none rounded-xl text-sm text-[#1A1A4B] dark:text-white focus:ring-2 focus:ring-[#6D67E4]/20 transition-all outline-none"
            />
          </div>
        </div>


        {/* Table */}
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

              {currentItems.map((user) => (
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
                      <span className="text-[#C0C0C0] text-[14px] font-medium">Offline</span>
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
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-8 py-10 text-center text-gray-400 font-medium">
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
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

      {/* Action Modal */}
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
                className="block w-full text-[28px] font-bold text-[#1A1A4B] dark:text-white hover:text-red-500 transition-colors"
                onClick={() => setIsActionModalOpen(false)}
              >
                Suspend
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default UserManagement;
