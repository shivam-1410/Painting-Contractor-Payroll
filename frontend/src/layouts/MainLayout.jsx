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
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [isDarkMode]);

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

        {/* DARK MODE TOGGLE AT BOTTOM OF SIDEBAR */}
        <div className="border-t border-blue-800/50 dark:border-slate-800/60 p-2 mb-2">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="w-full flex items-center rounded-xl overflow-hidden whitespace-nowrap transition-colors duration-200 text-blue-200 hover:bg-blue-800/70 hover:text-white"
            style={{ height: "44px" }}
          >
            <span className="flex items-center justify-center flex-shrink-0 text-lg" style={{ width: "44px", height: "44px" }}>
              {isDarkMode ? <FaSun className="text-amber-400" /> : <FaMoon />}
            </span>
            <span
              className="text-sm font-semibold pr-4"
              style={{
                opacity: isOpen ? 1 : 0,
                transition: "opacity 0.4s ease",
              }}
            >
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </span>
          </button>
        </div>

      </div>

      {/* MAIN CONTENT — offset by collapsed icon rail */}
      <div
        className="flex-1 overflow-y-auto p-6 bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-300"
        style={{ marginLeft: `${COLLAPSED_W}px` }}
      >
        {children}
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
