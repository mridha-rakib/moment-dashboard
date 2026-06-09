import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MoreVertical, ChevronLeft, ChevronRight, Users } from 'lucide-react';

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
    { id: 3, name: 'Courtney Henry', email: 'georgia.young@example.com', type: 'Business', product: 'Mooment Credits', date: 'Oct 25, 2026', amount: '$50.00', avatar: 'https://i.pravatar.cc/150?u=courtney' },
    { id: 4, name: 'Steve Herd', email: 'sarah.c@vesioh.com', type: 'Business', product: 'Ticket', date: 'Oct 25, 2026', amount: '$50.00', avatar: 'https://i.pravatar.cc/150?u=steve' },
    { id: 5, name: 'Jane Cooper', email: 'jane.cooper@example.com', type: 'Personal', product: 'Product', date: 'Oct 26, 2026', amount: '$45.00', avatar: 'https://i.pravatar.cc/150?u=jane' },
    { id: 6, name: 'Cody Fisher', email: 'cody.fisher@example.com', type: 'Business', product: 'Ticket', date: 'Oct 26, 2026', amount: '$75.00', avatar: 'https://i.pravatar.cc/150?u=cody' },
    { id: 7, name: 'Esther Howard', email: 'esther.howard@example.com', type: 'Personal', product: 'Mooment Credits', date: 'Oct 27, 2026', amount: '$30.00', avatar: 'https://i.pravatar.cc/150?u=esther' },
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

      {/* Action Modal */}
      {isActionModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsActionModalOpen(false)}
          ></div>
          <div className="relative bg-white dark:bg-[#1E1E2D] rounded-3xl p-8 w-full max-w-[320px] shadow-2xl animate-in fade-in zoom-in duration-200">
            <p className="text-[14px] text-gray-400 font-medium mb-6">more option</p>
            <div className="space-y-6 text-center">
              <button 
                className="block w-full text-[28px] font-bold text-[#1A1A4B] dark:text-white hover:text-[#6D67E4] dark:hover:text-indigo-400 transition-colors"
                onClick={() => {
                  navigate(`/payment-details/${selectedPayment.id}`);
                  setIsActionModalOpen(false);
                }}
              >
                View
              </button>
              <button 
                className="block w-full text-[28px] font-bold text-[#1A1A4B] dark:text-white hover:text-red-500 dark:hover:text-red-400 transition-colors"
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

export default PaymentManagement;
