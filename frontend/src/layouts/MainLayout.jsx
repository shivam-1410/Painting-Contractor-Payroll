import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Coins,
  Building2,
  FileSpreadsheet,
  Receipt,
  BarChart3,
  TrendingUp,
  Settings as SettingsIcon,
  Search,
  Bell,
  Sun,
  Moon,
  Laptop,
  Menu,
  X,
  Info,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Briefcase
} from "lucide-react";

const COLLAPSED_W = 76;   // premium wider rail width
const EXPANDED_W  = 260;  // full sidebar width

const MainLayout = ({ children }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const leaveTimer = useRef(null);
  
  // Mobile responsiveness states
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Theme state: "light" | "dark" | "system"
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "system";
  });

  // Notifications state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "System Initialized",
      message: "VC Dreams Contractor ERP has completed dashboard boot sequence.",
      time: "Just now",
      type: "info",
      read: false
    },
    {
      id: 2,
      title: "Attendance Updated",
      message: "Daily checklists compiled successfully.",
      time: "1 hour ago",
      type: "success",
      read: false
    },
    {
      id: 3,
      title: "Database Backup Completed",
      message: "Weekly secure cloud backup finished successfully.",
      time: "1 day ago",
      type: "success",
      read: true
    }
  ]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const hasUnread = notifications.some(n => !n.read);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = (currentTheme) => {
      if (currentTheme === "dark" || (currentTheme === "system" && mediaQuery.matches)) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    applyTheme(theme);
    localStorage.setItem("theme", theme);

    const handleSystemThemeChange = () => {
      const activeTheme = localStorage.getItem("theme") || "system";
      if (activeTheme === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, [theme]);

  const handleMouseEnter = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    leaveTimer.current = setTimeout(() => setIsOpen(false), 200);
  };

  const handleLinkClick = () => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">

      {/* MOBILE BACKDROP OVERLAY */}
      {isMobile && isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-955/40 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <div
        onMouseEnter={!isMobile ? handleMouseEnter : undefined}
        onMouseLeave={!isMobile ? handleMouseLeave : undefined}
        className="fixed top-0 left-0 h-full bg-white/75 dark:bg-slate-900/75 backdrop-blur-lg text-slate-800 dark:text-slate-200 overflow-hidden flex flex-col z-50 border-r border-slate-200/40 dark:border-slate-800/40 shadow-xl shadow-slate-100/5 transition-premium"
        style={
          isMobile
            ? {
                width: `${EXPANDED_W}px`,
                transform: isMobileOpen ? "translateX(0)" : "translateX(-100%)",
                transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              }
            : {
                width: isOpen ? `${EXPANDED_W}px` : `${COLLAPSED_W}px`,
                transition: "width 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              }
        }
      >

        {/* LOGO SECTION */}
        <div 
          className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 px-4 py-5 overflow-hidden whitespace-nowrap"
          style={{ minHeight: "80px" }}
        >
          <div className="flex items-center">
            <span className="flex items-center justify-center flex-shrink-0 w-11 h-11 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/15 border border-indigo-150/20 dark:border-indigo-500/30">
              <img
                src="/Logo.png"
                alt="VC Dreams Logo"
                className="h-7 w-7 object-contain"
              />
            </span>
            <div
              className="ml-3 flex flex-col transition-all duration-300"
              style={{
                opacity: (isMobile || isOpen) ? 1 : 0,
                transform: (isMobile || isOpen) ? "translateX(0)" : "translateX(-10px)",
              }}
            >
              <span className="text-[13px] font-black tracking-widest text-[#0B2C6F] dark:text-white uppercase font-outfit">
                VC DREAMS
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider font-outfit mt-0.5">
                Contractor ERP
              </span>
            </div>
          </div>
          {isMobile && (
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 mr-1 active:scale-95 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* NAVIGATION LINKS */}
        <div className="flex-1 flex flex-col gap-1.5 px-3 py-4 overflow-y-auto overflow-x-hidden">
          <SidebarLink to="/dashboard"         icon={<LayoutDashboard className="w-[20px] h-[20px]" />}  title="Dashboard"          isOpen={isOpen || isMobile} onClick={handleLinkClick} />
          <SidebarLink to="/labours"           icon={<Users className="w-[20px] h-[20px]" />}          title="Labour Management"  isOpen={isOpen || isMobile} onClick={handleLinkClick} />
          <SidebarLink to="/attendance"        icon={<CalendarCheck className="w-[20px] h-[20px]" />} title="Attendance"          isOpen={isOpen || isMobile} onClick={handleLinkClick} />
          <SidebarLink to="/payroll"           icon={<Coins className="w-[20px] h-[20px]" />}  title="Payroll"             isOpen={isOpen || isMobile} onClick={handleLinkClick} />
          <SidebarLink to="/site-payroll"      icon={<Briefcase className="w-[20px] h-[20px]" />} title="Site Payroll"        isOpen={isOpen || isMobile} onClick={handleLinkClick} />
          <SidebarLink to="/party-ledger"      icon={<FileSpreadsheet className="w-[20px] h-[20px]" />} title="Party Ledger"        isOpen={isOpen || isMobile} onClick={handleLinkClick} />
          <SidebarLink to="/receipts"          icon={<Receipt className="w-[20px] h-[20px]" />}    title="Receipts"            isOpen={isOpen || isMobile} onClick={handleLinkClick} />
          <SidebarLink to="/site-expenses"     icon={<Receipt className="w-[20px] h-[20px]" />}        title="Site Expenses"       isOpen={isOpen || isMobile} onClick={handleLinkClick} />
          <SidebarLink to="/sites"             icon={<Building2 className="w-[20px] h-[20px]" />}       title="Active Sites"        isOpen={isOpen || isMobile} onClick={handleLinkClick} />
          <SidebarLink to="/attendance-report" icon={<BarChart3 className="w-[20px] h-[20px]" />}       title="Attendance Reports"  isOpen={isOpen || isMobile} onClick={handleLinkClick} />
          <SidebarLink to="/payment-report"    icon={<TrendingUp className="w-[20px] h-[20px]" />}       title="Payment Reports"     isOpen={isOpen || isMobile} onClick={handleLinkClick} />
          <SidebarLink to="/settings"          icon={<SettingsIcon className="w-[20px] h-[20px]" />}    title="Settings"            isOpen={isOpen || isMobile} onClick={handleLinkClick} />
        </div>

      </div>

      {/* MAIN CONTAINER */}
      <div
        className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 relative"
        style={{ marginLeft: isMobile ? "0px" : `${COLLAPSED_W}px`, width: isMobile ? "100%" : `calc(100% - ${COLLAPSED_W}px)` }}
      >
        {/* Glow Blobs */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none animate-pulse-slow z-0"></div>
        <div className="absolute bottom-[-10%] left-[10%] w-[450px] h-[450px] bg-blue-500/5 dark:bg-blue-600/5 rounded-full blur-[140px] pointer-events-none animate-pulse-slow z-0" style={{ animationDelay: "3.5s" }}></div>
        
        {/* HEADER */}
        <header className="h-20 border-b border-slate-200/50 dark:border-slate-850/60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md flex items-center justify-between px-6 md:px-8 z-40 flex-shrink-0">
          
          <div className="flex items-center gap-4 flex-1">
            {isMobile && (
              <button
                onClick={() => setIsMobileOpen(true)}
                className="p-2.5 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200/60 dark:border-slate-800 active:scale-95 transition-all"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            
            {/* Global Search Bar */}
            <div className="relative max-w-md w-full hidden md:block group">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none group-focus-within:text-indigo-500 transition-colors">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search everywhere..."
                className="w-full pl-11 pr-12 py-2.5 bg-slate-100/80 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/80 text-slate-800 dark:text-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/80 focus:bg-white transition-all text-xs font-semibold"
              />
              <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider select-none">
                ⌘K
              </span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2.5 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border hover:scale-105 active:scale-95 transition-all ${
                  showNotifications
                    ? "text-indigo-650 dark:text-indigo-400 border-indigo-200/80 dark:border-indigo-500/30"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 border-slate-200/60 dark:border-slate-800"
                }`}
              >
                <Bell className="w-[18px] h-[18px]" />
                {hasUnread && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full border border-white dark:border-slate-900 animate-pulse"></span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    {/* Backdrop to close notification menu */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowNotifications(false)}
                    />
                    
                    {/* Popover Dropdown */}
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-80 sm:w-96 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border border-slate-200/50 dark:border-slate-800/50 rounded-3xl shadow-xl z-50 overflow-hidden"
                    >
                      {/* Header */}
                      <div className="p-4 bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-outfit uppercase tracking-wider">
                          Notifications
                        </span>
                        {hasUnread && (
                          <button
                            onClick={markAllAsRead}
                            className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-wide"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      {/* Items */}
                      <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850 custom-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                            <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700 animate-pulse" />
                            <p className="text-xs font-bold uppercase tracking-wider font-outfit">No notifications</p>
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              className={`p-4 flex gap-3 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/20 ${
                                !n.read ? "bg-indigo-50/20 dark:bg-indigo-950/10" : ""
                              }`}
                            >
                              <div className="mt-0.5 shrink-0">
                                {n.type === "success" ? (
                                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                                ) : n.type === "warning" ? (
                                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                                ) : (
                                  <Info className="w-4 h-4 text-indigo-500" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 font-outfit truncate">
                                    {n.title}
                                  </p>
                                  <span className="text-[9px] text-slate-450 dark:text-slate-500 whitespace-nowrap">
                                    {n.time}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                  {n.message}
                                </p>
                              </div>

                              <button
                                onClick={() => clearNotification(n.id)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 p-1 self-start rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Theme selector */}
            <div className="flex items-center bg-slate-100/80 dark:bg-slate-950/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-850/60">
              <button
                onClick={() => setTheme("light")}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  theme === "light"
                    ? "bg-white dark:bg-slate-800 text-amber-500 shadow-sm"
                    : "text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
                title="Light Mode"
              >
                <Sun className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setTheme("dark")}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  theme === "dark"
                    ? "bg-white dark:bg-slate-800 text-blue-500 shadow-sm"
                    : "text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
                title="Dark Mode"
              >
                <Moon className="w-4 h-4" />
              </button>

              <button
                onClick={() => setTheme("system")}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  theme === "system"
                    ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm"
                    : "text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
                title="System Theme"
              >
                <Laptop className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Avatar */}
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200/60 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400 font-extrabold text-sm flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50 shadow-inner select-none font-outfit">
                V
              </div>
              <div className="flex flex-col text-left hidden sm:flex">
                <span className="text-xs font-bold text-slate-800 dark:text-white font-outfit leading-tight">Viral Patel</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Admin</span>
              </div>
            </div>
          </div>

        </header>

        {/* PAGE CONTENT CONTAINER */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative z-10">
          <div key={location.pathname} className="animate-fade-in-up">
            {children}
          </div>
        </div>
      </div>

    </div>
  );
};

const SidebarLink = ({ to, icon, title, isOpen, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      title={!isOpen ? title : undefined}
      className={`flex items-center rounded-2xl overflow-hidden whitespace-nowrap relative
        transition-all duration-200 group
        ${isActive
          ? "bg-[#0B2C6F]/10 dark:bg-indigo-500/15 text-[#0B2C6F] dark:text-indigo-400 border border-slate-200/20 dark:border-indigo-500/10"
          : "text-slate-400 dark:text-slate-500 hover:bg-slate-100/80 dark:hover:bg-slate-900/60 hover:text-slate-800 dark:hover:text-slate-200"
        }`}
      style={{ height: "48px" }}
    >
      {/* Icon Container */}
      <span
        className={`flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:scale-105
          ${isActive ? "text-[#0B2C6F] dark:text-indigo-400" : "text-slate-400 dark:text-slate-550 group-hover:text-slate-700 dark:group-hover:text-slate-350"}`}
        style={{ width: "52px", height: "48px" }}
      >
        {icon}
      </span>

      {/* Label */}
      <span
        className="text-[11px] font-bold uppercase tracking-wider pr-4 transition-all duration-300 font-outfit"
        style={{
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? "translateX(0)" : "translateX(-8px)",
        }}
      >
        {title}
      </span>
    </Link>
  );
};

export default MainLayout;
