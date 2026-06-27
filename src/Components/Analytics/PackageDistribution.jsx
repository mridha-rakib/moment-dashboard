import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: 'Ticket', value: 70, color: '#3B2B68', count: '8.7k' },
  { name: 'Products', value: 30, color: '#D4C4FC', count: '3.7k' },
];

const PackageDistribution = () => {
  return (
    <div className="bg-white dark:bg-[#1E1E2D] p-8 rounded-[32px] shadow-sm border border-gray-50 dark:border-gray-800 flex flex-col h-full min-h-[500px] transition-colors">
      <h2 className="text-[22px] font-bold text-[#1A1A4B] dark:text-white mb-8 transition-colors">Package Distribution</h2>
      
      <div className="relative flex-1 flex flex-col items-center justify-center">
        <div className="w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Center Text */}
        <div className="absolute top-[125px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <p className="text-[28px] font-bold text-[#1A1A4B] dark:text-white transition-colors">12.4k</p>
          <p className="text-[14px] text-gray-400 font-medium">Total</p>
        </div>

        {/* Legend */}
        <div className="mt-8 space-y-4 w-full max-w-[200px]">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-[#1A1A4B] dark:text-white leading-tight transition-colors">{item.name}</span>
                <span className="text-[12px] text-gray-400 font-medium">{item.value}% ({item.count})</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default PackageDistribution;
