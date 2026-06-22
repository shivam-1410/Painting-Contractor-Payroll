import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";

import Labours from "./pages/Labours";

import Attendance from "./pages/Attendance";

import Salary from "./pages/Salary";

import Sites from "./pages/sites";

import Receipts from "./pages/Receipts";

import ReceiptView from "./pages/ReceiptView";

import Payroll from "./pages/Payroll";

import AttendanceReport from "./pages/AttendanceReport";

import PaymentReport from "./pages/PaymentReport";

import { Navigate } from "react-router-dom";


function App() {

  return (

    <BrowserRouter>

      <Routes>
        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
            />
          }
        />

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
        

      </Routes>
 

    </BrowserRouter>

  );

}

export default App;