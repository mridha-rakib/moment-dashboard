import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const EMPTY_RING_COLOR = '#E5E7EB';

const PackageDistribution = ({ distribution, ticketsIssued = 0 }) => {
  const safeDistribution = distribution ?? { fullPricePaid: 0, discounted: 0, free: 0, rewardedOrBonus: 0 };
  const isEmpty = ticketsIssued <= 0;

  const segments = [
    { name: 'Full-Price Paid', value: safeDistribution.fullPricePaid, color: '#3B2B68' },
    { name: 'Discounted', value: safeDistribution.discounted, color: '#9747FF' },
    { name: 'Free', value: safeDistribution.free, color: '#D4C4FC' },
    { name: 'Rewarded / Bonus', value: safeDistribution.rewardedOrBonus, color: '#B4A2C8' },
  ];

  // A genuinely empty period (no tickets issued) can't be rendered as four
  // zero-value pie slices without misleading proportions — show a neutral,
  // unfilled ring instead of fabricating a distribution.
  const pieData = isEmpty ? [{ name: 'No data', value: 1, color: EMPTY_RING_COLOR }] : segments;

  const formatCenterTotal = (value) => Number(value ?? 0).toLocaleString('en-US');

  return (
    <div className="bg-white dark:bg-[#1E1E2D] p-8 rounded-[32px] shadow-sm border border-gray-50 dark:border-gray-800 flex flex-col h-full min-h-[500px] transition-colors">
      <h2 className="text-[22px] font-bold text-[#1A1A4B] dark:text-white mb-8 transition-colors">Ticket Distribution</h2>

      <div className="relative flex-1 flex flex-col items-center justify-center">
        <div className="w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              {!isEmpty && (
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Center Text */}
        <div className="absolute top-[125px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <p className="text-[28px] font-bold text-[#1A1A4B] dark:text-white transition-colors">{formatCenterTotal(ticketsIssued)}</p>
          <p className="text-[14px] text-gray-400 font-medium">Total Tickets</p>
        </div>

        {/* Legend */}
        <div className="mt-8 space-y-4 w-full max-w-[200px]">
          {segments.map((item) => {
            const pct = ticketsIssued > 0 ? Math.round((item.value / ticketsIssued) * 100) : 0;
            return (
              <div key={item.name} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-[#1A1A4B] dark:text-white leading-tight transition-colors">{item.name}</span>
                  <span className="text-[12px] text-gray-400 font-medium">{pct}% ({item.value.toLocaleString('en-US')})</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default PackageDistribution;
