import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const formatCompactMoney = (minor, currency) => {
  const value = (Number(minor) || 0) / 100;
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  const symbol = (currency || 'usd').toUpperCase() === 'USD' ? '$' : `${(currency || 'usd').toUpperCase()} `;
  if (abs >= 1000) return `${sign}${symbol}${(abs / 1000).toFixed(1)}k`;
  return `${sign}${symbol}${abs.toFixed(0)}`;
};

const formatFullMoney = (minor, currency) => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: (currency || 'usd').toUpperCase(),
    }).format((Number(minor) || 0) / 100);
  } catch {
    return `$${((Number(minor) || 0) / 100).toFixed(2)}`;
  }
};

const RevenueMetrics = ({ data = [], currency = 'usd' }) => {
  const chartData = data.map((bucket) => ({
    name: bucket.label,
    grossTicketSalesMinor: bucket.grossTicketSalesMinor,
    successfulRefundsMinor: bucket.successfulRefundsMinor,
    netTicketRevenueMinor: bucket.netTicketRevenueMinor,
  }));

  return (
    <div className="bg-white dark:bg-[#1E1E2D] p-8 rounded-[32px] shadow-sm border border-gray-50 dark:border-gray-800 w-full h-[500px] transition-colors">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-[22px] font-bold text-[#1A1A4B] dark:text-white transition-colors">Ticket Revenue Trends</h2>
          <p className="text-[14px] text-gray-400 mt-1">Gross sales, refunds, and net revenue over time</p>
        </div>
      </div>

      <div className="w-full h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#C0C0C0', fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#C0C0C0', fontSize: 12 }}
              tickFormatter={(value) => formatCompactMoney(value, currency)}
            />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              cursor={{ stroke: '#F0F0F0', strokeWidth: 2 }}
              formatter={(value) => formatFullMoney(value, currency)}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '40px', fontSize: '14px', color: '#5C5C8A' }}
            />
            <Line
              type="monotone"
              dataKey="grossTicketSalesMinor"
              name="Gross Ticket Sales"
              stroke="#3B2B68"
              strokeWidth={4}
              dot={{ r: 0 }}
              activeDot={{ r: 8, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="successfulRefundsMinor"
              name="Successful Refunds"
              stroke="#D4C4FC"
              strokeWidth={4}
              dot={{ r: 0 }}
              activeDot={{ r: 8, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="netTicketRevenueMinor"
              name="Net Ticket Revenue"
              stroke="#9747FF"
              strokeWidth={4}
              dot={{ r: 0 }}
              activeDot={{ r: 8, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueMetrics;
