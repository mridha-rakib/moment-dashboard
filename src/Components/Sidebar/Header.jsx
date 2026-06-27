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
            onClick={() => setShowNotifications((prev) => !prev)}
            className={`relative p-2.5 rounded-xl transition-all duration-300 border text-gray-400 hover:text-[#6D67E4] dark:hover:text-indigo-400 focus:outline-none ${
              showNotifications 
                ? 'bg-[#E8EBFD] dark:bg-indigo-600/20 text-[#6D67E4] dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30 shadow-md shadow-indigo-500/5' 
                : 'bg-white dark:bg-[#2D2D3F] border-gray-100 dark:border-gray-800/80 hover:border-gray-200 dark:hover:border-gray-700 shadow-sm hover:shadow-md'
            }`}
          >
            <Bell size={18} />
            {notificationsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white ring-2 ring-white dark:ring-[#1E1E2D] shadow-md shadow-rose-500/20 animate-in zoom-in duration-300">
                <span className="absolute inline-flex h-full w-full rounded-full bg-rose-450 opacity-75 animate-ping" />
                <span className="relative z-10">{notificationsCount}</span>
              </span>
            )}
          </button>
        </div>
      </div>

      {showNotifications && (
        <div className="absolute right-6 top-[88px] z-[60] p-6 bg-white dark:bg-[#1E1E2D] rounded-[28px] shadow-2xl border border-gray-100 dark:border-gray-800/80 w-80 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-gray-800/80">
            <h2 className="text-base font-extrabold text-[#1A1A4B] dark:text-white">Notifications</h2>
            <span className="px-2.5 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-450 text-[10px] font-extrabold rounded-full tracking-wider uppercase">
              {notificationsCount} New
            </span>
          </div>

          <div className="space-y-3">
            {notifications.map((item, index) => (
              <div key={index} className="flex items-start gap-3.5 p-2 -mx-2 rounded-2xl hover:bg-gray-50/50 dark:hover:bg-[#2D2D3F]/50 transition-colors duration-200 cursor-pointer group">
                <div className="bg-indigo-50 dark:bg-indigo-500/10 p-2.5 rounded-xl text-[#6D67E4] dark:text-indigo-400 transition-all duration-300 group-hover:scale-105">
                  <Bell size={16} />
                </div>
                <div className="space-y-1">
                  <p className="text-[13px] font-semibold text-gray-700 dark:text-gray-200 leading-snug group-hover:text-[#6D67E4] dark:group-hover:text-indigo-400 transition-colors">
                    {item.message}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold">{item.time}</p>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => {
              setShowNotifications(false);
              navigate('/support-center');
            }}
            className="mt-6 w-full bg-[#454070] dark:bg-indigo-600 text-white py-3 rounded-xl text-xs font-bold hover:bg-[#34305c] dark:hover:bg-indigo-750 transition-all shadow-md shadow-indigo-500/10"
          >
            View All Notifications
          </button>
        </div>
      )}
    </div>

  );
};

export default Header;
