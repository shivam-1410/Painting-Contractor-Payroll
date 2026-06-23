import { Link } from "react-router-dom";

import {
  FaTachometerAlt,
  FaUsers,
  FaClipboardCheck,
  FaMoneyBillWave,
  FaBuilding,
  FaFileInvoice,
  FaChartBar,
} from "react-icons/fa";

const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">

      {/* SIDEBAR */}

      <div className="w-[280px] min-w-[280px] bg-blue-950 text-white p-6 overflow-y-auto flex flex-col">

        {/* LOGO */}
        <div className="flex flex-col items-center mb-8 border-b border-blue-900/50 pb-6">
          <img 
            src="/Logo.png" 
            alt="VC Dreams Logo" 
            className="h-16 w-auto mb-3 object-contain rounded-xl bg-white/10 p-1"
          />
          <h1 className="text-2xl font-black tracking-wider text-white">VC Dreams</h1>
        </div>

        <div className="flex flex-col gap-2">

          <SidebarLink
            to="/dashboard"
            icon={<FaTachometerAlt />}
            title="Dashboard"
          />

          <SidebarLink
            to="/labours"
            icon={<FaUsers />}
            title="Labours"
          />

          <SidebarLink
            to="/attendance"
            icon={<FaClipboardCheck />}
            title="Attendance"
          />

          <SidebarLink
            to="/salary"
            icon={<FaMoneyBillWave />}
            title="Salary"
          />

          <SidebarLink
            to="/sites"
            icon={<FaBuilding />}
            title="Sites"
          />

          <SidebarLink
            to="/site-expenses"
            icon={<FaMoneyBillWave />}
            title="Site Expenses"
          />
         
          <SidebarLink
            to="/receipts"
            icon={<FaFileInvoice />}
            title="Receipts"
          />

          <SidebarLink
            to="/payroll"
            icon={<FaMoneyBillWave />}
            title="Payroll"
          />

          <SidebarLink
            to="/attendance-report"
            icon={<FaChartBar />}
            title="Attendance Reports"
          />

          <SidebarLink
            to="/payment-report"
            icon={<FaChartBar />}
            title="Payment Reports"
          />

        </div>

      </div>

      {/* MAIN CONTENT */}

      <div className="flex-1 overflow-y-auto p-6">

        {children}

      </div>

    </div>
  );
};

const SidebarLink = ({
  to,
  icon,
  title,
}) => {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 hover:bg-blue-900 px-5 py-3.5 rounded-2xl transition-all duration-300 text-lg font-medium whitespace-nowrap"
    >
      <span className="text-xl">
        {icon}
      </span>

      <span>
        {title}
      </span>
    </Link>
  );
};

export default MainLayout;
