import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Dashboard from "./pages/Dashboard";

import Labours from "./pages/Labours";

import Attendance from "./pages/AttendancePage";

import Salary from "./pages/Salary";

import Sites from "./pages/SitesPage";

import Receipts from "./pages/Receipts";

import ReceiptView from "./pages/ReceiptView";

import Payroll from "./pages/Payroll";

import AttendanceReport from "./pages/AttendanceReport";

import PaymentReport from "./pages/PaymentReport";

import SiteExpense from "./pages/SiteExpense";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import SitePayroll from "./pages/SitePayroll";
import PartyLedger from "./pages/PartyLedger";

import { Navigate } from "react-router-dom";


function App() {

  return (

    <BrowserRouter>

      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/labours"
          element={<Labours />}
        />

        <Route
          path="/attendance"
          element={<Attendance />}
        />

        <Route
          path="/salary"
          element={<Salary />}
        />

        <Route
          path="/sites"
          element={<Sites />}
        />

        <Route
          path="/receipts"
          element={<Receipts />}
        />

        <Route
          path="/receipt/:id"
          element={<ReceiptView />}
        />

        <Route
          path="/payroll"
          element={<Payroll />}
        />

        <Route
          path="/attendance-report"
          element={
            <AttendanceReport />
          }
        />

        <Route
          path="/payment-report"
          element={
            <PaymentReport />
          }
        />
        
        <Route
          path="/site-expenses"
          element={
            <SiteExpense />
          }
        />

        <Route
          path="/settings"
          element={
            <Settings />
          }
        />

        <Route
          path="/site-payroll"
          element={
            <SitePayroll />
          }
        />

        <Route
          path="/party-ledger"
          element={
            <PartyLedger />
          }
        />
        

      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: "12px", fontFamily: "Inter, sans-serif", fontSize: "13px" },
        }}
      />

    </BrowserRouter>

  );

}

export default App;