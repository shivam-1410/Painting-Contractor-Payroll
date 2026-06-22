import {
  FaUsers,
  FaMoneyBillWave,
  FaClipboardCheck,
  FaFileInvoice,
  FaHome,
  FaBuilding,
} from "react-icons/fa";

import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-72 h-screen overflow-y-auto bg-blue-950 text-white p-6 fixed top-0 left-0">

      {/* LOGO */}

      <div className="mb-12">

        <h1 className="text-3xl font-bold">
          VC Dreams
        </h1>

        <p className="text-blue-200 mt-2">
          Contractor ERP System
        </p>

      </div>

      {/* MENU */}

      <div className="flex flex-col gap-3">

        <Link
          to="/"
          className="flex items-center gap-4 p-4 rounded-xl hover:bg-blue-800 transition-all duration-300"
        >
          <FaHome className="text-xl" />

          <span className="text-lg">
            Dashboard
          </span>
        </Link>

        <Link
          to="/labours"
          className="flex items-center gap-4 p-4 rounded-xl hover:bg-blue-800 transition-all duration-300"
        >
          <FaUsers className="text-xl" />

          <span className="text-lg">
            Labour Management
          </span>
        </Link>

        <Link
          to="/attendance"
          className="flex items-center gap-4 p-4 rounded-xl hover:bg-blue-800 transition-all duration-300"
        >
          <FaClipboardCheck className="text-xl" />

          <span className="text-lg">
            Attendance
          </span>
        </Link>

        <Link
          to="/salary"
          className="flex items-center gap-4 p-4 rounded-xl hover:bg-blue-800 transition-all duration-300"
        >
          <FaMoneyBillWave className="text-xl" />

          <span className="text-lg">
            Salary Management
          </span>
        </Link>

        <Link
          to="/receipts"
          className="flex items-center gap-4 p-4 rounded-xl hover:bg-blue-800 transition-all duration-300"
        >
          <FaFileInvoice className="text-xl" />

          <span className="text-lg">
            Receipts
          </span>
        </Link>

        <Link
          to="/sites"
          className="flex items-center gap-4 p-4 rounded-xl hover:bg-blue-800 transition-all duration-300"
        >
          <FaBuilding className="text-xl" />

          <span className="text-lg">
            Site Management
          </span>
        </Link>

        <Link
          to="/site-expenses"
          className="flex items-center gap-4 p-4 rounded-xl hover:bg-blue-800 transition-all duration-300">
       
          <FaMoneyBillWave className="text-xl" />

          <span className="text-lg text-red-500 font-bold">
            THIS IS A TEST
          </span>
        </Link>

      </div>

      {/* FOOTER */}

      <div className="absolute bottom-6 left-6 text-blue-300 text-sm">
        VC Dreams © 2026
      </div>
      

    </div>
  );
};

export default Sidebar;