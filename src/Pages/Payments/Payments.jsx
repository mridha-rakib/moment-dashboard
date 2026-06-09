import React from 'react';
import { Eye, Download, ChevronLeft, ChevronRight, Search, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock payment records data
export const paymentRecordsData = [
  {
    jobId: '#JOB-1247',
    customer: { name: 'Sarah Johnson', email: 'sarah.j@email.com' },
    worker: { name: 'Mike Roberts', email: 'mike.r@email.com' },
    totalAmount: 250.00,
    platformFee: 30.00,
    workerPayout: 220.00,
    paymentMethod: 'Visa',
    status: 'Completed',
    jobTitle: 'Lawn Mowing & Garden Cleanup',
    serviceDate: 'March 12, 2024',
    duration: '3.5 hours',
    address: '1234 Oak Street, Springfield, IL 62701',
    customerId: '#CUST-8901',
    phone: '(555) 123-4567',
    workerId: '#WORK-3456',
    rating: 4.9,
    serviceAmount: 125.00,
    processingFee: 2.50,
    transactionId: 'txn_1Oe8K2Si4dsFKkn3GJpHOcL7',
    gateway: 'Stripe',
    processedAt: 'March 15, 2024, 2:45:32 PM UTC',
    payoutStatus: 'Paid',
    payoutDate: 'March 15, 2024',
    cardEnding: '4242'
  },
  {
    jobId: '#JOB-1246',
    customer: { name: 'James Wilson', email: 'james.w@email.com' },
    worker: { name: 'Tom Anderson', email: 'tom.a@email.com' },
    totalAmount: 180.00,
    platformFee: 21.60,
    workerPayout: 158.40,
    paymentMethod: 'MC',
    status: 'Processing',
    jobTitle: 'House Cleaning Service',
    serviceDate: 'March 13, 2024',
    duration: '2.5 hours',
    address: '5678 Maple Ave, Chicago, IL 60601',
    customerId: '#CUST-8902',
    phone: '(555) 234-5678',
    workerId: '#WORK-3457',
    rating: 4.7,
    serviceAmount: 95.00,
    processingFee: 1.90,
    transactionId: 'txn_2Pf9L3Tj5etGLlo4HqIPdM8',
    gateway: 'Stripe',
    processedAt: 'March 16, 2024, 10:22:15 AM UTC',
    payoutStatus: 'Processing',
    payoutDate: 'Pending',
    cardEnding: '5555'
  },
  {
    jobId: '#JOB-1245',
    customer: { name: 'Emily Davis', email: 'emily.d@email.com' },
    worker: { name: 'David Brown', email: 'david.b@email.com' },
    totalAmount: 320.00,
    platformFee: 38.40,
    workerPayout: 281.60,
    paymentMethod: 'PayPal',
    status: 'Completed',
    jobTitle: 'Plumbing Repair',
    serviceDate: 'March 11, 2024',
    duration: '4 hours',
    address: '9012 Pine Street, Boston, MA 02101',
    customerId: '#CUST-8903',
    phone: '(555) 345-6789',
    workerId: '#WORK-3458',
    rating: 4.8,
    serviceAmount: 168.00,
    processingFee: 3.36,
    transactionId: 'txn_3Qg0M4Uk6fuHMmp5IrJQeN9',
    gateway: 'PayPal',
    processedAt: 'March 14, 2024, 3:15:45 PM UTC',
    payoutStatus: 'Paid',
    payoutDate: 'March 14, 2024',
    cardEnding: 'N/A'
  },
  {
    jobId: '#JOB-1244',
    customer: { name: 'Robert Miller', email: 'robert.m@email.com' },
    worker: { name: 'Mike Roberts', email: 'mike.r@email.com' },
    totalAmount: 150.00,
    platformFee: 18.00,
    workerPayout: 132.00,
    paymentMethod: 'Visa',
    status: 'Pending',
    jobTitle: 'Electrical Installation',
    serviceDate: 'March 14, 2024',
    duration: '2 hours',
    address: '3456 Oak Lane, Seattle, WA 98101',
    customerId: '#CUST-8904',
    phone: '(555) 456-7890',
    workerId: '#WORK-3456',
    rating: 4.9,
    serviceAmount: 79.00,
    processingFee: 1.58,
    transactionId: 'txn_4Rh1N5Vl7gvINnq6JsKRfO0',
    gateway: 'Stripe',
    processedAt: 'March 17, 2024, 1:30:20 PM UTC',
    payoutStatus: 'Pending',
    payoutDate: 'Pending',
    cardEnding: '8888'
  },
  {
    jobId: '#JOB-1243',
    customer: { name: 'Lisa Taylor', email: 'lisa.t@email.com' },
    worker: { name: 'Tom Anderson', email: 'tom.a@email.com' },
    totalAmount: 275.00,
    platformFee: 33.00,
    workerPayout: 242.00,
    paymentMethod: 'MC',
    status: 'Completed',
    jobTitle: 'Carpentry Work',
    serviceDate: 'March 10, 2024',
    duration: '3 hours',
    address: '7890 Cedar Road, Portland, OR 97201',
    customerId: '#CUST-8905',
    phone: '(555) 567-8901',
    workerId: '#WORK-3457',
    rating: 4.6,
    serviceAmount: 145.00,
    processingFee: 2.90,
    transactionId: 'txn_5Si2O6Wm8hwJOor7KtLSgP1',
    gateway: 'Stripe',
    processedAt: 'March 13, 2024, 11:45:30 AM UTC',
    payoutStatus: 'Paid',
    payoutDate: 'March 13, 2024',
    cardEnding: '4444'
  }
];

const Payments = () => {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-700';
      case 'Processing':
        return 'bg-orange-100 text-orange-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleViewDetails = (record) => {
    navigate('/payment-details', { state: { record } });
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-[#13131F] transition-colors duration-300">
      <div className="mx-auto mt-16">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 bg-white dark:bg-[#1E1E2D] rounded-lg shadow border border-gray-100 dark:border-gray-800 transition-colors">
            <div className="flex items-center justify-center w-12 h-12 mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="mb-1 text-sm text-gray-500">Total Payments</div>
            <div className="mb-1 text-3xl font-bold text-[#1A1A4B] dark:text-white transition-colors">$48,250</div>
            <div className="text-sm text-green-600">↑ 12.5% from last month</div>
          </div>

          <div className="p-6 bg-white dark:bg-[#1E1E2D] rounded-lg shadow border border-gray-100 dark:border-gray-800 transition-colors">
            <div className="flex items-center justify-center w-12 h-12 mb-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="mb-1 text-sm text-gray-500">Platform Earnings (12%)</div>
            <div className="mb-1 text-3xl font-bold text-[#1A1A4B] dark:text-white transition-colors">$5,790</div>
            <div className="text-sm text-green-600">↑ 8.3% from last month</div>
          </div>


          <div className="p-6 bg-white dark:bg-[#1E1E2D] rounded-lg shadow border border-gray-100 dark:border-gray-800 transition-colors">
            <div className="flex items-center justify-center w-12 h-12 mb-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="mb-1 text-sm text-gray-500">Worker Payouts (88%)</div>
            <div className="mb-1 text-3xl font-bold text-[#1A1A4B] dark:text-white transition-colors">$42,460</div>
            <div className="text-sm text-green-600">↑ 13.1% from last month</div>
          </div>

          <div className="p-6 bg-white dark:bg-[#1E1E2D] rounded-lg shadow border border-gray-100 dark:border-gray-800 transition-colors">
            <div className="flex items-center justify-center w-12 h-12 mb-4 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="mb-1 text-sm text-gray-500">Pending Payments</div>
            <div className="mb-1 text-3xl font-bold text-[#1A1A4B] dark:text-white transition-colors">$2,840</div>
            <div className="text-sm text-gray-500">8 transactions pending</div>
          </div>
        </div>

        {/* Payment Records Table */}
        <div className="bg-white dark:bg-[#1E1E2D] rounded-lg shadow border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#1A1A4B] dark:text-white transition-colors">Payment Records</h2>
              <button className="flex items-center px-4 py-2 text-white transition-colors bg-gray-900 dark:bg-indigo-600 rounded-lg hover:bg-gray-800 dark:hover:bg-indigo-700">

                <Download className="w-4 h-4 mr-2" />
                Export Report
              </button>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Search by job ID, customer, or worker..."
                  className="w-full py-2 pl-10 pr-4 bg-white dark:bg-[#2D2D3F] border border-gray-300 dark:border-gray-700 rounded-lg text-[#1A1A4B] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              <select className="px-4 py-2 bg-white dark:bg-[#2D2D3F] border border-gray-300 dark:border-gray-700 rounded-lg text-[#1A1A4B] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
                <option>All Status</option>
                <option>Completed</option>
                <option>Processing</option>
                <option>Pending</option>
              </select>
              <select className="px-4 py-2 bg-white dark:bg-[#2D2D3F] border border-gray-300 dark:border-gray-700 rounded-lg text-[#1A1A4B] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
                <option>All Methods</option>
                <option>Visa</option>
                <option>MC</option>
                <option>PayPal</option>
              </select>
              <button className="flex items-center px-4 py-2 bg-white dark:bg-[#2D2D3F] border border-gray-300 dark:border-gray-700 rounded-lg text-[#1A1A4B] dark:text-white hover:bg-gray-50 dark:hover:bg-[#3D3D4F] transition-colors">
                <Calendar className="w-4 h-4 mr-2" />
                mm/dd/yyyy
              </button>
            </div>

          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#2D2D3F] transition-colors">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Job ID</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Worker</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Total Amount</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Platform Fee</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Worker Payout</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Payment Method</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-[#1E1E2D] divide-y divide-gray-200 dark:divide-gray-800 transition-colors">

                {paymentRecordsData.map((record, index) => (
                  <tr key={index} className="transition-colors hover:bg-gray-50 dark:hover:bg-[#2D2D3F]/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white transition-colors">{record.jobId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white transition-colors">{record.customer.name}</div>
                      <div className="text-sm text-gray-500">{record.customer.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white transition-colors">{record.worker.name}</div>
                      <div className="text-sm text-gray-500">{record.worker.email}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white transition-colors">${record.totalAmount.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">${record.platformFee.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">(12%)</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white transition-colors">${record.workerPayout.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">(88%)</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white transition-colors">{record.paymentMethod}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleViewDetails(record)}
                        className="text-gray-600 transition-colors hover:text-gray-900"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800 transition-colors">
            <div className="text-sm text-gray-500">
              Showing 1 to 5 of 47 results
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] disabled:opacity-50 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="px-3 py-2 text-white bg-gray-900 dark:bg-indigo-600 rounded-lg">1</button>
              <button className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-400 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] transition-colors">2</button>
              <button className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-400 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] transition-colors">3</button>
              <button className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Payments;