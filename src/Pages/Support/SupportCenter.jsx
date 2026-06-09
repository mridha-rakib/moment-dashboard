import React from 'react';
import SupportCenter from '../../Components/SupportCenter/SupportCenter';

const SupportCenterPage = () => {
  return (
    <div className="min-h-screen p-8 bg-[#F8F9FD] dark:bg-[#13131F] transition-colors duration-300">
      <div className="mx-auto max-w-[1600px]">

        <SupportCenter />
      </div>
    </div>
  );
};

export default SupportCenterPage;
