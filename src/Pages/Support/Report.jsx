import React from 'react';
import Report from '../../Components/Report/Report';

const ReportPage = () => {
  return (
    <div className="min-h-screen p-8 bg-[#F8F9FD] dark:bg-[#13131F] transition-colors duration-300">
      <div className="mx-auto max-w-[1600px]">

        <Report />
      </div>
    </div>
  );
};

export default ReportPage;
