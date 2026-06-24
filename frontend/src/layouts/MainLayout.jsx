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
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-900 transition-colors duration-300">

      {/* SIDEBAR */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="fixed top-0 left-0 h-full bg-blue-950 dark:bg-slate-950 text-white overflow-hidden flex flex-col z-30 shadow-xl"
        style={{
          width: isOpen ? `${EXPANDED_W}px` : `${COLLAPSED_W}px`,
          transition: "width 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >

        {/* LOGO */}
        <div className="flex items-center border-b border-blue-800/50 dark:border-slate-800/60 px-2 py-4 overflow-hidden whitespace-nowrap"
          style={{ minHeight: "68px" }}
        >
          {/* Logo in same 44px column as nav icons */}
          <span className="flex items-center justify-center flex-shrink-0" style={{ width: "44px", height: "44px" }}>
            <img
              src="/Logo.png"
              alt="VC Dreams Logo"
              className="h-10 w-10 object-contain rounded-xl bg-white/10 p-1"
            />
          </span>
          <h1
            className="text-base font-black tracking-wider text-white ml-2"
            style={{
              opacity: isOpen ? 1 : 0,
              transition: "opacity 0.4s ease",
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
        className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-300"
        style={{ marginLeft: `${COLLAPSED_W}px` }}
      >
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
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
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
      className={`flex items-center rounded-xl overflow-hidden whitespace-nowrap
        transition-colors duration-200
        ${isActive
          ? "bg-blue-600 text-white shadow-md"
          : "text-blue-200 hover:bg-blue-800/70 hover:text-white"
        }`}
      style={{ height: "44px" }}
    >
      {/* Icon container — always 44×44, centered in both states */}
      <span
        className="flex items-center justify-center flex-shrink-0 text-lg"
        style={{ width: "44px", height: "44px" }}
      >
        {icon}
      </span>

      {/* Label — fades in when expanded */}
      <span
        className="text-sm font-semibold pr-4"
        style={{
          opacity: isOpen ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
      >
        {title}
      </span>
    </Link>
  );
};

export default MainLayout;
