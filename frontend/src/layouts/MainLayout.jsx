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

      <div className="w-[85px] hover:w-[265px] bg-blue-950 text-white p-4 overflow-y-auto transition-all duration-300 ease-in-out group flex flex-col">

        <h1 className="text-3xl font-black mb-12 text-center group-hover:text-left transition-all duration-300 whitespace-nowrap overflow-hidden">
          <span className="hidden group-hover:inline">VC Dreams</span>
          <span className="inline group-hover:hidden">VC</span>
        </h1>

        <div className="flex flex-col gap-3">

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

          {/* NEW SITE EXPENSES TAB */}
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
      className="flex items-center gap-4 hover:bg-blue-900 px-4 py-4 rounded-2xl transition-all duration-300 text-lg font-medium whitespace-nowrap overflow-hidden"
    >
      <span className="text-xl min-w-[24px] flex justify-center">
        {icon}
      </span>

      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {title}
      </span>
    </Link>
  );
};

export default MainLayout;
