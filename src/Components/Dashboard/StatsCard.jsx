import React from 'react';

const colorMap = {
  indigo: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-100 dark:border-indigo-500/20',
    badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
    glow: 'from-indigo-500/10 to-transparent',
    hoverBorder: 'hover:border-indigo-300 dark:hover:border-indigo-500/40',
  },
  rose: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-100 dark:border-rose-500/20',
    badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    glow: 'from-rose-500/10 to-transparent',
    hoverBorder: 'hover:border-rose-300 dark:hover:border-rose-500/40',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-100 dark:border-emerald-500/20',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    glow: 'from-emerald-500/10 to-transparent',
    hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-500/40',
  },
  amber: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-100 dark:border-amber-500/20',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    glow: 'from-amber-500/10 to-transparent',
    hoverBorder: 'hover:border-amber-300 dark:hover:border-amber-500/40',
  },
  violet: {
    bg: 'bg-violet-500/10',
    text: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-100 dark:border-violet-500/20',
    badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20',
    glow: 'from-violet-500/10 to-transparent',
    hoverBorder: 'hover:border-violet-300 dark:hover:border-violet-500/40',
  },
};

const StatsCard = ({ title, value, change, pillColor, icon: Icon, showIcon = true, color = 'indigo' }) => {
  const activeColor = colorMap[color] || colorMap.indigo;

  // Determine trend icon if change exists
  const isPositive = change ? !change.includes('-') : true;

  return (
    <div className={`group bg-white dark:bg-[#1E1E2D] p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800/80 flex flex-col justify-between h-[150px] relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-black/40 ${activeColor.hoverBorder}`}>
      {/* Background glow shadow effect on hover */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${activeColor.glow} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="flex justify-between items-start z-10">
        <span className="text-[12px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase">{title}</span>
        
        {/* Render change trend indicator */}
        {change && (
          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 ${
            pillColor || (isPositive 
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20')
          }`}>
            {isPositive ? '↑' : '↓'} {change.replace(/^[+-]\s*/, '')}
          </span>
        )}

        {/* Render Card Icon */}
        {showIcon && Icon && (
          <div className={`p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110 ${activeColor.bg} ${activeColor.text}`}>
            {React.isValidElement(Icon) ? Icon : <Icon size={18} />}
          </div>
        )}
      </div>

      <div className="mt-4 z-10">
        <h3 className="text-[32px] font-extrabold tracking-tight text-[#1A1A4B] dark:text-white transition-colors">
          {value}
        </h3>
      </div>
    </div>
  );
};

export default StatsCard;
