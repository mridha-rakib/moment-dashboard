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

const data = [
  { name: 'Mon', pro: 2200, starter: 1500, enterprise: 800 },
  { name: 'Tue', pro: 2500, starter: 1700, enterprise: 1200 },
  { name: 'Wed', pro: 3300, starter: 2100, enterprise: 900 },
  { name: 'Thu', pro: 3100, starter: 2300, enterprise: 1100 },
  { name: 'Fri', pro: 3400, starter: 2000, enterprise: 1000 },
  { name: 'Sat', pro: 3200, starter: 2400, enterprise: 1200 },
  { name: 'Sun', pro: 3500, starter: 2200, enterprise: 1100 },
];

const RevenueMetrics = () => {
  return (
    <div className="bg-white dark:bg-[#1E1E2D] p-8 rounded-[32px] shadow-sm border border-gray-50 dark:border-gray-800 w-full h-[500px] transition-colors">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-[22px] font-bold text-[#1A1A4B] dark:text-white transition-colors">Revenue Metrics</h2>
          <p className="text-[14px] text-gray-400 mt-1">Comparison of Products, Tickets, and Mooment Credits</p>
        </div>
      </div>


      <div className="w-full h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
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
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              cursor={{ stroke: '#F0F0F0', strokeWidth: 2 }}
            />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle" 
              wrapperStyle={{ paddingBottom: '40px', fontSize: '14px', color: '#5C5C8A' }}
            />
            <Line
              type="monotone"
              dataKey="pro"
              name="Pro"
              stroke="#3B2B68"
              strokeWidth={4}
              dot={{ r: 0 }}
              activeDot={{ r: 8, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="starter"
              name="Starter"
              stroke="#D4C4FC"
              strokeWidth={4}
              dot={{ r: 0 }}
              activeDot={{ r: 8, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="enterprise"
              name="Enterprise"
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
