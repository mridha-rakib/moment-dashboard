import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const UserMetrics = ({ series = [] }) => {
  const chartData = series.map((bucket) => ({
    name: bucket.label,
    users: bucket.newUsers,
  }));

  return (
    <div className="bg-white dark:bg-[#1E1E2D] p-8 rounded-[32px] shadow-sm border border-gray-50 dark:border-gray-800 w-full h-[400px] transition-colors">
      <h2 className="text-[20px] font-bold text-[#1A1A4B] dark:text-white mb-8 transition-colors">User Metrics</h2>


      <div className="w-full h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            barSize={12}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#C0C0C0', fontSize: 12 }}
              dy={15}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#C0C0C0', fontSize: 12 }}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              formatter={(value) => [value, 'New Users']}
            />
            <Bar
              dataKey="users"
              fill="#B4A2C8"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default UserMetrics;
