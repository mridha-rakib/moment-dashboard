import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { RxHamburgerMenu } from "react-icons/rx";
import { Bell, ArrowLeft } from "lucide-react";
import adminImage from "../../assets/image/adminkickclick.jpg";

const Header = ({ showDrawer }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsCount] = useState(5);
  const navigate = useNavigate();
  const location = useLocation();

  const getPageTitle = (path) => {
    switch (path) {
      case '/':
      case '/dashboard':
        return { title: "Dashboard Overview", subtitle: "Platform Overview" };
      case '/analytics':
        return { title: "Analytics Overview", subtitle: "Monitor your business performance and revenue trends." };
      case '/user-management':
        return { title: "User Management", subtitle: "Manage personnel access credentials" };
      case '/payment-management':
        return { title: "Payment Management", subtitle: "Manage payment information" };
      case '/support-center':
        return { title: "Support Center", subtitle: "Manage customer support here" };
      case '/report':
        return { title: "Report", subtitle: "Manage mooment app report" };
      case '/settings':
        return { title: "Settings", subtitle: "Configure platform preferences" };
      default:
        // Handle dynamic routes
        if (path.startsWith('/user-management/')) {
          return { 
            title: "Detail of user", 
            subtitle: "This section will help you to view information of the user",
            showBack: true,
            backPath: '/user-management'
          };
        }
        if (path.startsWith('/event-details/')) {
          return { 
            title: "Details of Event", 
            subtitle: "This section will help you to view information of the event",
            showBack: true,
            backPath: -1 
          };
        }
        if (path.startsWith('/payment-details/')) {
          return { 
            title: "Detail of payment", 
            subtitle: "This section will help you to view information of the user purchased item",
            showBack: true,
            backPath: '/payment-management'
          };
        }
        if (path.startsWith('/report-details/')) {
          return { 
            title: "Report Details", 
            subtitle: "This page contain result of the report, so that admin can assess the whole thing.",
            showBack: true,
            backPath: '/report'
          };
        }
        if (path.startsWith('/support-message/')) {
          return { 
            title: "View Support message", 
            subtitle: "This section will help you to view message of that client",
            showBack: true,
            backPath: '/support-center'
          };
        }
        return { title: "Xenog Dashboard", subtitle: "Admin Portal" };
    }
  };

  const { title, subtitle, showBack, backPath } = getPageTitle(location.pathname);

  const notifications = [
    { message: "A new user joined your app.", time: "Fri, 12:30pm" },
    { message: "Profile report received.", time: "Fri, 12:30pm" },
    { message: "A new verification request.", time: "Fri, 12:30pm" },
    { message: "New comment on your post.", time: "Fri, 12:30pm" },
  ];

  return (
    <div className="relative bg-white dark:bg-[#1E1E2D] border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-6">
          <RxHamburgerMenu
            className="text-2xl text-gray-500 cursor-pointer lg:hidden"
            onClick={showDrawer}
          />
          <div className="flex items-center gap-4">
            {showBack && (
              <button 
                onClick={() => navigate(backPath)}
                className="p-2.5 bg-gray-50 dark:bg-[#2D2D3F] rounded-xl text-gray-400 hover:text-[#6D67E4] transition-all hover:bg-gray-100 dark:hover:bg-[#3D3D4F]"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div className="space-y-1">
              <h2 className="font-bold text-[#1A1A4B] dark:text-white text-2xl tracking-tight transition-colors">
                {title}
              </h2>
              <p className="text-sm font-medium text-gray-400">{subtitle}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button
            className="relative p-2.5 transition bg-gray-50 dark:bg-[#2D2D3F] rounded-xl hover:bg-gray-100 dark:hover:bg-[#3D3D4F] text-gray-400"
            onClick={() => setShowNotifications((prev) => !prev)}
          >
            <Bell className="text-xl" />
            {notificationsCount > 0 && (
              <span className="absolute top-2.5 right-2.5 bg-red-500 h-2 w-2 rounded-full border border-white dark:border-[#1E1E2D]"></span>
            )}
          </button>
        </div>
      </div>
      {showNotifications && (
        <div className="absolute right-6 top-[88px] z-[60] p-6 bg-white dark:bg-[#1E1E2D] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 w-80 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-50 dark:border-gray-800">
            <h2 className="text-lg font-bold text-[#1A1A4B] dark:text-white">Notifications</h2>
            <span className="px-2 py-0.5 bg-red-50 dark:bg-red-900/30 text-red-500 text-[10px] font-bold rounded-full">5 NEW</span>
          </div>
          <div className="space-y-6">
            {notifications.map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="bg-[#F8F9FD] dark:bg-[#2D2D3F] p-2.5 rounded-xl text-[#6D67E4]">
                  <Bell size={18} />
                </div>
                <div className="space-y-1">
                  <p className="text-[13px] font-bold text-[#5C5C8A] dark:text-gray-200 leading-tight">
                    {item.message}
                  </p>
                  <p className="text-[11px] text-gray-300 font-medium">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-8 w-full bg-[#1A1A4B] dark:bg-indigo-600 text-white py-3.5 rounded-2xl text-sm font-bold hover:bg-black dark:hover:bg-indigo-700 transition-all shadow-lg shadow-black/10">
            View All Notifications
          </button>
        </div>
      )}
    </div>

  );
};

export default Header;
