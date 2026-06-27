import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MoreVertical, ChevronLeft, ChevronRight, Users, Eye, ShieldAlert, X, DollarSign, CreditCard, Tag } from 'lucide-react';

const PaymentManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const itemsPerPage = 4;

  const paymentData = useMemo(() => [
    { id: 1, name: 'Theresa Webb', email: 'bill.sanders@example.com', type: 'Personal', product: 'Ticket', date: 'Oct 25, 2026', amount: '$50.00', avatar: 'https://i.pravatar.cc/150?u=theresa' },
    { id: 2, name: 'Marvin McKinney', email: 'tim.jennings@example.com', type: 'Personal', product: 'Product', date: 'Oct 25, 2026', amount: '$50.00', avatar: 'https://i.pravatar.cc/150?u=marvin' },
    { id: 3, name: 'Courtney Henry', email: 'georgia.young@example.com', type: 'Business', product: 'Ticket', date: 'Oct 25, 2026', amount: '$50.00', avatar: 'https://i.pravatar.cc/150?u=courtney' },
    { id: 4, name: 'Steve Herd', email: 'sarah.c@vesioh.com', type: 'Business', product: 'Ticket', date: 'Oct 25, 2026', amount: '$50.00', avatar: 'https://i.pravatar.cc/150?u=steve' },
    { id: 5, name: 'Jane Cooper', email: 'jane.cooper@example.com', type: 'Personal', product: 'Product', date: 'Oct 26, 2026', amount: '$45.00', avatar: 'https://i.pravatar.cc/150?u=jane' },
    { id: 6, name: 'Cody Fisher', email: 'cody.fisher@example.com', type: 'Business', product: 'Ticket', date: 'Oct 26, 2026', amount: '$75.00', avatar: 'https://i.pravatar.cc/150?u=cody' },
    { id: 7, name: 'Esther Howard', email: 'esther.howard@example.com', type: 'Personal', product: 'Product', date: 'Oct 27, 2026', amount: '$30.00', avatar: 'https://i.pravatar.cc/150?u=esther' },
    { id: 8, name: 'Jenny Wilson', email: 'jenny.wilson@example.com', type: 'Business', product: 'Product', date: 'Oct 27, 2026', amount: '$120.00', avatar: 'https://i.pravatar.cc/150?u=jenny' },
  ], []);

  const filteredData = useMemo(() => {
    return paymentData.filter(payment => 
      payment.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      payment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.product.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, paymentData]);

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

  const openActionModal = (payment) => {
    setSelectedPayment(payment);
    setIsActionModalOpen(true);
  };

  return (
    <div className="space-y-8 relative">
      {/* Search Bar Section */}
      <div className="flex justify-end">
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
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#1E1E2D] border-none rounded-2xl text-sm text-[#1A1A4B] dark:text-white shadow-sm focus:ring-2 focus:ring-[#6D67E4]/20 transition-all outline-none"
          />
        </div>
      </div>


      {/* Table Section */}
      <div className="bg-white dark:bg-[#1E1E2D] rounded-[24px] shadow-sm border border-gray-50 dark:border-gray-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 dark:border-gray-800 bg-[#FBFBFF]/50 dark:bg-[#2D2D3F]/50">
                <th className="px-8 py-5 text-[12px] font-bold text-[#8E8EBC] uppercase tracking-widest">Name</th>
                <th className="px-8 py-5 text-[12px] font-bold text-[#8E8EBC] uppercase tracking-widest">Account Type</th>
                <th className="px-8 py-5 text-[12px] font-bold text-[#8E8EBC] uppercase tracking-widest">Type of Product</th>
                <th className="px-8 py-5 text-[12px] font-bold text-[#8E8EBC] uppercase tracking-widest">Paymen Date</th>
                <th className="px-8 py-5 text-[12px] font-bold text-[#8E8EBC] uppercase tracking-widest">Amount</th>
                <th className="px-8 py-5 text-[12px] font-bold text-[#8E8EBC] uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">

              {currentItems.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50/50 dark:hover:bg-[#2D2D3F]/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <img src={payment.avatar} alt={payment.name} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-[#1A1A4B] dark:text-white text-[15px] transition-colors">{payment.name}</p>
                        <p className="text-[12px] text-gray-400">{payment.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-bold text-[#4B4B4B] dark:text-gray-300 text-[14px] transition-colors">{payment.type}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-medium text-[#4B4B4B] dark:text-gray-400 text-[14px] transition-colors">{payment.product}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-medium text-[#4B4B4B] dark:text-gray-400 text-[14px] transition-colors">{payment.date}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-bold text-[#1A1A4B] dark:text-white text-[15px] transition-colors">{payment.amount}</span>
                  </td>

                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => openActionModal(payment)}
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

      {/* Premium Action Modal */}
      {isActionModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Blur Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-md transition-opacity"
            onClick={() => setIsActionModalOpen(false)}
          ></div>

          {/* Modal Card */}
          <div className="relative bg-white dark:bg-[#1E1E2D] rounded-[32px] border border-gray-150 dark:border-gray-800 p-8 w-full max-w-[360px] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setIsActionModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* User Identity Panel */}
            <div className="flex flex-col items-center text-center mt-2 mb-6">
              <img
                src={selectedPayment.avatar}
                alt={selectedPayment.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500/20 shadow-md mb-3"
              />
              <h3 className="text-lg font-bold text-[#1A1A4B] dark:text-white leading-tight">
                {selectedPayment.name}
              </h3>
              <p className="text-xs text-gray-400 mt-1 font-medium">
                {selectedPayment.email}
              </p>
            </div>

            {/* Payment Context */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[11px] font-bold">
                <DollarSign size={12} />
                {selectedPayment.amount}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 text-[#6D67E4] dark:text-indigo-400 rounded-full text-[11px] font-bold">
                <Tag size={12} />
                {selectedPayment.product}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 rounded-full text-[11px] font-bold">
                <CreditCard size={12} />
                {selectedPayment.type}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* View Details */}
              <button
                className="flex items-center justify-center gap-3 w-full py-3.5 bg-indigo-50 dark:bg-indigo-600/10 text-[#6D67E4] dark:text-indigo-400 font-bold text-xs rounded-2xl hover:bg-[#E8EBFD] dark:hover:bg-indigo-600/20 transition-all cursor-pointer"
                onClick={() => {
                  navigate(`/payment-details/${selectedPayment.id}`);
                  setIsActionModalOpen(false);
                }}
              >
                <Eye size={16} />
                View Details
              </button>

              {/* Suspend */}
              <button
                className="flex items-center justify-center gap-3 w-full py-3.5 bg-rose-500/10 border border-rose-500/25 dark:border-rose-500/10 text-rose-500 font-bold text-xs rounded-2xl hover:bg-rose-500/20 transition-all cursor-pointer"
                onClick={() => setIsActionModalOpen(false)}
              >
                <ShieldAlert size={16} />
                Suspend Payment
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PaymentManagement;
