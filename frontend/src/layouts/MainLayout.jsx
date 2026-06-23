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

      <div className="w-[260px] min-w-[260px] bg-blue-950 text-white p-6 overflow-y-auto">

        <h1 className="text-4xl font-black mb-12">
          VC Dreams
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
      className="flex items-center gap-4 hover:bg-blue-900 px-5 py-4 rounded-2xl transition-all duration-300 text-lg font-medium"
    >
      <span className="text-xl">
        {icon}
      </span>

      {title}
    </Link>
  );
};

export default MainLayout;
