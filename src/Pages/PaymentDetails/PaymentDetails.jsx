import React from 'react';
import { useParams } from 'react-router-dom';

const PaymentDetails = () => {
  const { id } = useParams();

  const payment = {
    user: {
      name: 'Steve Hard',
      username: '@username',
      avatar: 'https://i.pravatar.cc/150?u=steve',
      status: 'Active',
      accountType: 'Personal Account'
    },
    metrics: [
      { label: 'Product', value: '$45.00' },
      { label: 'Ticket', value: '$105.00' },
      { label: 'Total', value: '$150.00' }
    ]
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] dark:bg-[#13131F] p-8 transition-colors duration-300">

      <div className="mx-auto max-w-[1400px]">
        {/* User Profile Section */}
        <div className="flex items-center gap-8 mb-16 animate-in fade-in duration-500">
          <div className="relative">
            <img 
              src={payment.user.avatar} 
              alt={payment.user.name} 
              className="w-24 h-24 rounded-full border-4 border-white dark:border-[#1E1E2D] shadow-lg object-cover transition-colors" 
            />

            {/* Verified Badge if needed */}
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-[#10B981] text-white text-[10px] font-bold rounded-lg uppercase tracking-wider">
                {payment.user.status}
              </span>
              <span className="px-3 py-1 bg-gray-200 dark:bg-[#1E1E2D] text-gray-500 dark:text-gray-400 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-colors">
                {payment.user.accountType}
              </span>

            </div>
            <h2 className="text-[32px] font-bold text-[#1A1A4B] dark:text-white transition-colors">{payment.user.name}</h2>
            <p className="text-gray-400 font-medium">{payment.user.username}</p>

          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 animate-in slide-in-from-bottom-4 duration-700 delay-200">
          {payment.metrics.map((metric, index) => (
            <div key={index} className="space-y-4">
              <h3 className="text-[24px] font-bold text-[#1A1A4B] dark:text-white transition-colors">{metric.label}</h3>
              <p className="text-[48px] font-bold text-[#1A1A4B] dark:text-white tracking-tight transition-colors">
                {metric.value}
              </p>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
};

export default PaymentDetails;
