import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  FaTachometerAlt,
  FaUsers,
  FaClipboardCheck,
  FaMoneyBillWave,
  FaBuilding,
  FaFileInvoice,
  FaChartBar,
  FaReceipt,
  FaSun,
  FaMoon,
} from "react-icons/fa";

const COLLAPSED_W = 68;   // icon rail width
const EXPANDED_W  = 260;  // full sidebar width

const MainLayout = ({ children }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const leaveTimer = useRef(null);
  
  // Theme state: "light" | "dark" | "system"
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "system";
  });

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

    // Listen for OS system theme changes
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
    leaveTimer.current = setTimeout(() => setIsOpen(false), 300);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

      {/* SIDEBAR */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="fixed top-0 left-0 h-full bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 overflow-hidden flex flex-col z-30 border-r border-slate-200/50 dark:border-slate-800/80 shadow-lg shadow-slate-100/30 dark:shadow-none"
        style={{
          width: isOpen ? `${EXPANDED_W}px` : `${COLLAPSED_W}px`,
          transition: "width 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >

        {/* LOGO */}
        <div className="flex items-center border-b border-slate-100 dark:border-slate-900/60 px-2 py-4 overflow-hidden whitespace-nowrap"
          style={{ minHeight: "68px" }}
        >
          {/* Logo in same 44px column as nav icons */}
          <span className="flex items-center justify-center flex-shrink-0" style={{ width: "44px", height: "44px" }}>
            <img
              src="/Logo.png"
              alt="VC Dreams Logo"
              className="h-10 w-10 object-contain rounded-xl bg-slate-100 dark:bg-white/5 p-1 border border-slate-200/40 dark:border-white/10"
            />
          </span>
          <h1
            className="text-xs font-black tracking-widest text-slate-800 dark:text-white uppercase ml-3 font-outfit"
            style={{
              opacity: isOpen ? 1 : 0,
              transition: "opacity 0.3s ease",
            }}
          >
            VC Dreams
          </h1>
        </div>

        {/* NAV LINKS */}
        <div className="flex-1 flex flex-col gap-1 px-2 py-3 overflow-y-auto overflow-x-hidden">
          <SidebarLink to="/dashboard"         icon={<FaTachometerAlt />}  title="Dashboard"          isOpen={isOpen} />
          <SidebarLink to="/labours"           icon={<FaUsers />}          title="Labours"             isOpen={isOpen} />
          <SidebarLink to="/attendance"        icon={<FaClipboardCheck />} title="Attendance"          isOpen={isOpen} />
          <SidebarLink to="/salary"            icon={<FaMoneyBillWave />}  title="Salary"              isOpen={isOpen} />
          <SidebarLink to="/sites"             icon={<FaBuilding />}       title="Sites"               isOpen={isOpen} />
          <SidebarLink to="/site-expenses"     icon={<FaReceipt />}        title="Site Expenses"       isOpen={isOpen} />
          <SidebarLink to="/receipts"          icon={<FaFileInvoice />}    title="Receipts"            isOpen={isOpen} />
          <SidebarLink to="/payroll"           icon={<FaMoneyBillWave />}  title="Payroll"             isOpen={isOpen} />
          <SidebarLink to="/attendance-report" icon={<FaChartBar />}       title="Attendance Reports"  isOpen={isOpen} />
          <SidebarLink to="/payment-report"    icon={<FaChartBar />}       title="Payment Reports"     isOpen={isOpen} />
        </div>

      </div>

      {/* MAIN CONTENT AREA */}
      <div
        className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 relative"
        style={{ marginLeft: `${COLLAPSED_W}px` }}
      >
        {/* Background glow blobs for premium aesthetic */}
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-[120px] pointer-events-none animate-pulse-slow z-0"></div>
        <div className="absolute bottom-[-10%] left-[10%] w-[350px] h-[350px] bg-indigo-500/10 dark:bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none animate-pulse-slow z-0" style={{ animationDelay: "2s" }}></div>
        {/* TOP HEADER BAR */}
        <header className="h-16 border-b border-slate-200/60 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md flex items-center justify-between px-8 z-10 flex-shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-outfit">
              VC Dreams Contractor ERP
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* 3-State Theme Mode Selector */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/80 transition-colors duration-300">
              <button
                onClick={() => setTheme("light")}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                  theme === "light"
                    ? "bg-white dark:bg-slate-800 text-amber-500 shadow-sm"
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
                title="Light Mode"
              >
                <FaSun className="text-sm" />
              </button>
              
              <button
                onClick={() => setTheme("dark")}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                  theme === "dark"
                    ? "bg-white dark:bg-slate-800 text-blue-500 shadow-sm"
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
                title="Dark Mode"
              >
                <FaMoon className="text-sm" />
              </button>

              <button
                onClick={() => setTheme("system")}
                className={`py-1.5 px-2.5 rounded-lg text-[10px] font-extrabold tracking-tight uppercase transition-all duration-200 ${
                  theme === "system"
                    ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm"
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
                title="Use System Preference"
              >
                System
              </button>
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

const SidebarLink = ({ to, icon, title, isOpen }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      title={!isOpen ? title : undefined}
      className={`flex items-center rounded-xl overflow-hidden whitespace-nowrap relative
        transition-all duration-300 group
        ${isActive
          ? "bg-indigo-600/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 shadow-sm border-l-4 border-indigo-600 dark:border-indigo-500"
          : "text-slate-400 dark:text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-900/60 hover:text-slate-800 dark:hover:text-slate-200"
        }`}
      style={{ height: "44px" }}
    >
      {/* Icon container — always 44×44, centered in both states */}
      <span
        className={`flex items-center justify-center flex-shrink-0 text-lg transition-transform duration-300 group-hover:scale-110
          ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"}`}
        style={{ width: "44px", height: "44px" }}
      >
        {icon}
      </span>

      {/* Label — fades in when expanded */}
      <span
        className="text-xs font-bold uppercase tracking-wider pr-4 transition-all duration-300"
        style={{
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? "translateX(0)" : "translateX(-8px)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}
      >
        {title}
      </span>
    </Link>
  );
};

export default MainLayout;
