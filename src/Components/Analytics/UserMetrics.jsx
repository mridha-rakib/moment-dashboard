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

const data = [
  { name: 'Jan', users: 270 },
  { name: 'Feb', users: 330 },
  { name: 'Mar', users: 330 },
  { name: 'Apr', users: 230 },
  { name: 'May', users: 230 },
  { name: 'Jun', users: 170 },
  { name: 'Jul', users: 170 },
  { name: 'Aug', users: 130 },
  { name: 'Sep', users: 310 },
  { name: 'Oct', users: 310 },
];

const UserMetrics = () => {
  return (
    <div className="bg-white dark:bg-[#1E1E2D] p-8 rounded-[32px] shadow-sm border border-gray-50 dark:border-gray-800 w-full h-[400px] transition-colors">
      <h2 className="text-[20px] font-bold text-[#1A1A4B] dark:text-white mb-8 transition-colors">User Metrics</h2>

      
      <div className="w-full h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
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
            />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
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
