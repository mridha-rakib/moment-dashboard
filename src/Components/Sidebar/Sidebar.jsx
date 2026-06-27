import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  Info,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Analytics01Icon, CreditCardPosIcon, HeadsetIcon } from "@hugeicons/core-free-icons";
import adminlogo from "../../assets/image/adminlogo.png";
import adminImage from "../../assets/image/adminkickclick.jpg";
import { useAuthStore } from "../../features/auth";
import { getStorageDownloadUrl } from "@/shared/storage/object-storage.service";

const Sidebar = ({ closeDrawer, isCollapsed = false, onToggleCollapse }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [avatarSrc, setAvatarSrc] = React.useState(adminImage);

  const sections = [
    {
      title: "MAIN",
      items: [
        { icon: <LayoutGrid size={20} />, label: "Dashboard", Link: "/" },
        { icon: <HugeiconsIcon icon={Analytics01Icon} size={20} />, label: "Analytics", Link: "/analytics" },
      ]
    },
    {
      title: "CORE",
      items: [
        { icon: <Users size={20} />, label: "User Management", Link: "/user-management" },
        { icon: <HugeiconsIcon icon={CreditCardPosIcon} size={20} />, label: "Payment Management", Link: "/payment-management" },
        { icon: <Info size={20} />, label: "Reports", Link: "/report" },
        { icon: <HugeiconsIcon icon={HeadsetIcon} size={20} />, label: "Support Center", Link: "/support-center" },
        { icon: <Settings size={20} />, label: "Settings", Link: "/settings" },
      ]
    }
  ];

  React.useEffect(() => {
    let isCurrent = true;

    if (!authUser?.avatarKey) {
      setAvatarSrc(adminImage);
      return () => {
        isCurrent = false;
      };
    }

    getStorageDownloadUrl(authUser.avatarKey)
      .then((url) => {
        if (isCurrent) {
          setAvatarSrc(url);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setAvatarSrc(adminImage);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [authUser?.avatarKey]);

  const user = {
    name: authUser?.name || "Admin User",
    email: authUser?.email || "admin@xenog.com",
    avatar: avatarSrc
  };

  const handleLogout = async () => {
    await logout();
    navigate("/sign-in", { replace: true });
  };

  return (
    <div className="w-full h-full bg-[#0C0B10] flex flex-col border-r border-white/5 shadow-2xl transition-all duration-300">
      {/* Sidebar Header */}
      <div className={`flex transition-all duration-300 ${isCollapsed ? "flex-col gap-4 items-center justify-center px-2 py-6 animate-in fade-in" : "p-8 pb-4 items-center justify-between"}`}>
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3 min-w-0"}`}>
          <img
            src={adminlogo}
            alt="Mooment admin logo"
            className="w-11 h-11 rounded-2xl object-contain ring-1 ring-white/10 shadow-lg flex-shrink-0"
          />
          {!isCollapsed && (
            <div className="min-w-0 animate-in fade-in duration-300">
              <h1 className="text-white font-black text-lg tracking-tight leading-none">Mooment</h1>
              <p className="mt-1 text-gray-500 text-[10px] font-bold uppercase tracking-wider">Super Admin</p>
            </div>
          )}
        </div>
        <button 
          onClick={onToggleCollapse} 
          className="text-gray-500 hover:text-white transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>
      </div>

      {/* Navigation Items */}
      <div className={`flex-1 overflow-y-auto py-4 custom-scrollbar ${isCollapsed ? "px-2" : "px-6"}`}>
        {sections.map((section, idx) => (
          <div key={section.title} className={idx !== 0 ? (isCollapsed ? "mt-4 pt-4 border-t border-white/5" : "mt-8") : ""}>
            {!isCollapsed && (
              <p className="px-4 text-[10px] font-bold text-gray-600 mb-4 tracking-[0.2em] animate-in fade-in duration-300">
                {section.title}
              </p>
            )}
            <div className="space-y-2">
              {section.items.map((item) => {
                const isActive = location.pathname === item.Link ||
                  (item.Link !== '/' && location.pathname.startsWith(item.Link));
                return (
                  <Link
                    key={item.label}
                    to={item.Link}
                    onClick={closeDrawer}
                    title={isCollapsed ? item.label : undefined}
                    className={`flex items-center transition-all duration-300 group ${
                      isCollapsed 
                        ? `w-12 h-12 justify-center rounded-2xl mx-auto ${isActive ? "bg-[#B2ABBA] text-[#1A1A4B]" : "text-gray-400 hover:text-white hover:bg-white/5"}`
                        : `gap-4 px-4 py-3.5 rounded-2xl ${isActive ? "bg-[#B2ABBA] text-[#1A1A4B] font-bold shadow-lg shadow-black/20" : "text-gray-400 hover:text-white hover:bg-white/5"}`
                    }`}
                  >
                    <span className={`${isActive ? "text-[#1A1A4B]" : "text-gray-500 group-hover:text-white"} transition-colors`}>
                      {item.icon}
                    </span>
                    {!isCollapsed && <span className="text-[15px]">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Footer / User Profile */}
      <div className={`border-t border-white/5 transition-all duration-300 ${isCollapsed ? "flex flex-col gap-4 items-center justify-center px-2 py-6" : "p-6"}`}>
        <div className={`flex items-center justify-between rounded-2xl hover:bg-white/5 transition-all group ${isCollapsed ? "p-1 flex-col gap-3 justify-center w-full" : "p-2"}`}>
          <div className={`flex items-center ${isCollapsed ? "flex-col justify-center gap-1.5" : "gap-3"}`}>
            <img
              src={user.avatar}
              alt="User"
              className="w-10 h-10 rounded-full border border-white/10 object-cover flex-shrink-0"
            />
            {!isCollapsed && (
              <div className="hidden lg:block overflow-hidden max-w-[120px] animate-in fade-in duration-300">
                <p className="text-white text-sm font-bold truncate">{user.name}</p>
                <p className="text-gray-500 text-[11px] truncate">{user.email}</p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Sign out"
            className={`p-2 text-gray-500 hover:text-white transition-all ${isCollapsed ? "hover:bg-red-500/10 hover:text-red-400 rounded-xl" : ""}`}
          >
            <LogOut size={isCollapsed ? 18 : 16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
