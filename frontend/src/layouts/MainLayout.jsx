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

const SIDEBAR_WIDTH = 265; // px when open

const MainLayout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const leaveTimer = useRef(null);

  const handleMouseEnter = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    leaveTimer.current = setTimeout(() => setIsOpen(false), 350);
  };

  return (
    <div className="relative h-screen overflow-hidden bg-slate-100">

      {/* HOVER TRIGGER ZONE — invisible strip on the left edge, always present */}
      <div
        onMouseEnter={handleMouseEnter}
        className="fixed left-0 top-0 h-full z-40"
        style={{ width: "14px" }}
      />

      {/* DARK OVERLAY — dims the page when sidebar is open */}
      <div
        className="fixed inset-0 z-20"
        style={{
          backgroundColor: isOpen ? "rgba(0,0,0,0.18)" : "rgba(0,0,0,0)",
          transition: "background-color 0.5s ease",
          pointerEvents: isOpen ? "auto" : "none",
        }}
        onClick={() => setIsOpen(false)}
      />

      {/* SIDEBAR */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="fixed top-0 h-full bg-blue-950 text-white overflow-y-auto flex flex-col z-30 shadow-2xl"
        style={{
          width: `${SIDEBAR_WIDTH}px`,
          transform: isOpen ? "translateX(0)" : `translateX(-${SIDEBAR_WIDTH}px)`,
          transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          left: 0,
        }}
      >

        {/* LOGO */}
        <div className="flex flex-col items-center mb-4 border-b border-blue-800/60 pb-5 pt-5 px-4">
          <img
            src="/Logo.png"
            alt="VC Dreams Logo"
            className="h-14 w-14 object-contain rounded-xl bg-white/10 p-1"
          />
          <h1 className="text-lg font-black tracking-wider text-white mt-3">
            VC Dreams
          </h1>
        </div>

        {/* NAV LINKS */}
        <div className="flex flex-col gap-1 px-3 pb-4">
          <SidebarLink to="/dashboard"         icon={<FaTachometerAlt />}  title="Dashboard" />
          <SidebarLink to="/labours"           icon={<FaUsers />}          title="Labours" />
          <SidebarLink to="/attendance"        icon={<FaClipboardCheck />} title="Attendance" />
          <SidebarLink to="/salary"            icon={<FaMoneyBillWave />}  title="Salary" />
          <SidebarLink to="/sites"             icon={<FaBuilding />}       title="Sites" />
          <SidebarLink to="/site-expenses"     icon={<FaReceipt />}        title="Site Expenses" />
          <SidebarLink to="/receipts"          icon={<FaFileInvoice />}    title="Receipts" />
          <SidebarLink to="/payroll"           icon={<FaMoneyBillWave />}  title="Payroll" />
          <SidebarLink to="/attendance-report" icon={<FaChartBar />}       title="Attendance Reports" />
          <SidebarLink to="/payment-report"    icon={<FaChartBar />}       title="Payment Reports" />
        </div>

      </div>

      {/* MAIN CONTENT — full width, no offset since sidebar overlays */}
      <div className="h-full overflow-y-auto p-6">
        {children}
      </div>

    </div>
  );
};

const SidebarLink = ({ to, icon, title }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-4 px-4 rounded-xl h-12 text-sm font-semibold transition-all duration-200
        ${isActive
          ? "bg-blue-600 text-white shadow-md"
          : "text-blue-200 hover:bg-blue-800/70 hover:text-white"
        }`}
    >
      <span className="text-lg flex-shrink-0 w-5 flex items-center justify-center">
        {icon}
      </span>
      <span>{title}</span>
    </Link>
  );
};

export default MainLayout;
