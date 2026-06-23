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

const MainLayout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const leaveTimer = useRef(null);

  const handleMouseEnter = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    leaveTimer.current = setTimeout(() => setIsOpen(false), 150);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">

      {/* HOVER TRIGGER ZONE - thin strip on the very left edge */}
      <div
        onMouseEnter={handleMouseEnter}
        className="fixed left-0 top-0 h-full w-3 z-30"
        style={{ cursor: "default" }}
      />

      {/* SIDEBAR */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="fixed left-0 top-0 h-full bg-blue-950 text-white overflow-y-auto flex flex-col z-20 shadow-2xl"
        style={{
          width: isOpen ? "265px" : "72px",
          transition: "width 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
          minWidth: isOpen ? "265px" : "72px",
        }}
      >

        {/* LOGO */}
        <div className="flex flex-col items-center mb-6 border-b border-blue-800/60 pb-5 pt-4 px-3 whitespace-nowrap overflow-hidden">
          <img
            src="/Logo.png"
            alt="VC Dreams Logo"
            className="h-12 w-12 object-contain rounded-xl bg-white/10 p-1 flex-shrink-0"
          />
          <div
            className="overflow-hidden transition-all duration-200"
            style={{
              maxHeight: isOpen ? "60px" : "0px",
              opacity: isOpen ? 1 : 0,
              marginTop: isOpen ? "10px" : "0px",
            }}
          >
            <h1 className="text-lg font-black tracking-wider text-white text-center whitespace-nowrap">
              VC Dreams
            </h1>
          </div>
        </div>

        {/* NAV LINKS */}
        <div className="flex flex-col gap-1 px-2 pb-4">
          <SidebarLink to="/dashboard"       icon={<FaTachometerAlt />} title="Dashboard"          isOpen={isOpen} />
          <SidebarLink to="/labours"         icon={<FaUsers />}         title="Labours"             isOpen={isOpen} />
          <SidebarLink to="/attendance"      icon={<FaClipboardCheck />}title="Attendance"          isOpen={isOpen} />
          <SidebarLink to="/salary"          icon={<FaMoneyBillWave />} title="Salary"              isOpen={isOpen} />
          <SidebarLink to="/sites"           icon={<FaBuilding />}      title="Sites"               isOpen={isOpen} />
          <SidebarLink to="/site-expenses"   icon={<FaReceipt />}       title="Site Expenses"       isOpen={isOpen} />
          <SidebarLink to="/receipts"        icon={<FaFileInvoice />}   title="Receipts"            isOpen={isOpen} />
          <SidebarLink to="/payroll"         icon={<FaMoneyBillWave />} title="Payroll"             isOpen={isOpen} />
          <SidebarLink to="/attendance-report" icon={<FaChartBar />}   title="Attendance Reports"  isOpen={isOpen} />
          <SidebarLink to="/payment-report"  icon={<FaChartBar />}      title="Payment Reports"     isOpen={isOpen} />
        </div>

      </div>

      {/* MAIN CONTENT — offset by collapsed sidebar width */}
      <div
        className="flex-1 overflow-y-auto p-6"
        style={{
          marginLeft: "72px",
          transition: "margin-left 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
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
      className={`flex items-center rounded-xl transition-all duration-200 h-12 overflow-hidden whitespace-nowrap
        ${isActive
          ? "bg-blue-600 text-white shadow-md"
          : "text-blue-200 hover:bg-blue-800/70 hover:text-white"
        }`}
      style={{
        paddingLeft: isOpen ? "16px" : "0px",
        paddingRight: isOpen ? "16px" : "0px",
        justifyContent: isOpen ? "flex-start" : "center",
        gap: isOpen ? "14px" : "0px",
      }}
      title={!isOpen ? title : undefined}
    >
      <span className="text-xl flex-shrink-0 flex items-center justify-center w-6">
        {icon}
      </span>

      <span
        className="text-sm font-semibold overflow-hidden transition-all duration-200"
        style={{
          maxWidth: isOpen ? "200px" : "0px",
          opacity: isOpen ? 1 : 0,
        }}
      >
        {title}
      </span>
    </Link>
  );
};

export default MainLayout;
