import React from 'react';
import UserManagement from '../../Components/UserManagement/UserManagement';

const UserManagementPage = () => {
  return (
    <div className="min-h-screen p-8 bg-[#F8F9FD] dark:bg-[#13131F] transition-colors duration-300">
      <div className="mx-auto max-w-[1600px]">

        <UserManagement />
      </div>
    </div>
  );
};

export default UserManagementPage;
