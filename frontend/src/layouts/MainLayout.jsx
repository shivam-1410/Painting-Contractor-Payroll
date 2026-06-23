import { useState, useRef } from "react";
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
} from "react-icons/fa";

const COLLAPSED_W = 68;   // icon rail width
const EXPANDED_W  = 260;  // full sidebar width

const MainLayout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const leaveTimer = useRef(null);

  const handleMouseEnter = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    leaveTimer.current = setTimeout(() => setIsOpen(false), 300);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">

      {/* SIDEBAR */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="fixed top-0 left-0 h-full bg-blue-950 text-white overflow-hidden flex flex-col z-30 shadow-xl"
        style={{
          width: isOpen ? `${EXPANDED_W}px` : `${COLLAPSED_W}px`,
          transition: "width 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >

        {/* LOGO */}
        <div className="flex items-center border-b border-blue-800/50 px-3 py-4 gap-3 overflow-hidden whitespace-nowrap"
          style={{ minHeight: "72px" }}
        >
          <img
            src="/Logo.png"
            alt="VC Dreams Logo"
            className="h-11 w-11 flex-shrink-0 object-contain rounded-xl bg-white/10 p-1"
          />
          <h1
            className="text-base font-black tracking-wider text-white"
            style={{
              opacity: isOpen ? 1 : 0,
              transition: "opacity 0.4s ease",
            }}
          >
            VC Dreams
          </h1>
        </div>

        {/* NAV LINKS */}
        <div className="flex flex-col gap-1 px-2 py-3 overflow-y-auto overflow-x-hidden">
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

      {/* MAIN CONTENT — offset by collapsed icon rail */}
      <div
        className="flex-1 overflow-y-auto p-6"
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
      className={`flex items-center rounded-xl h-11 overflow-hidden whitespace-nowrap
        transition-colors duration-200
        ${isActive
          ? "bg-blue-600 text-white shadow-md"
          : "text-blue-200 hover:bg-blue-800/70 hover:text-white"
        }`}
      style={{
        paddingLeft: isOpen ? "14px" : "0px",
        justifyContent: isOpen ? "flex-start" : "center",
        gap: isOpen ? "14px" : "0px",
        transition: "padding 0.5s cubic-bezier(0.16,1,0.3,1), gap 0.5s cubic-bezier(0.16,1,0.3,1), background-color 0.2s ease",
      }}
    >
      <span className="text-lg flex-shrink-0 w-5 flex items-center justify-center">
        {icon}
      </span>
      <span
        className="text-sm font-semibold"
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
