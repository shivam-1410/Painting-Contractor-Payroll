import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import API from "../services/api";

import {
  FaUsers,
  FaClipboardCheck,
  FaMoneyBillWave,
  FaBuilding,
  FaHistory,
} from "react-icons/fa";

const Dashboard = () => {

  const [dashboardData, setDashboardData] =
    useState({

      totalLabours: 0,
      totalAttendance: 0,
      pendingPayments: 0,
      totalSites: 0,
      monthlyPayroll: 0,

      recentAttendance: [],
      recentPayments: [],

    });

  useEffect(() => {

    fetchDashboard();

  }, []);

  const fetchDashboard =
    async () => {

      try {

        const res =
          await API.get(
            "/dashboard"
          );

        setDashboardData(
          res.data
        );

      } catch (error) {

        console.log(error);

      }

    };

  return (
    <MainLayout>
      <div className="p-8 max-w-7xl mx-auto animate-fade-in-up">
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight font-outfit">
              Dashboard Overview
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Welcome back to VC Dreams Contractor ERP portal.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mr-1.5 animate-pulse"></span>
              Live Database Connected
            </span>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {/* Card 1 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 p-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Total Labours
                </p>
                <h2 className="text-4xl font-extrabold text-slate-800 dark:text-white mt-2 font-outfit">
                  {dashboardData.totalLabours}
                </h2>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <FaUsers className="text-2xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-slate-400 dark:text-slate-500">
              <span>Registered workforce</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 p-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Present Today
                </p>
                <h2 className="text-4xl font-extrabold text-slate-800 dark:text-white mt-2 font-outfit">
                  {dashboardData.totalAttendance}
                </h2>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                <FaClipboardCheck className="text-2xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-slate-400 dark:text-slate-500">
              <span>Active attendance</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 p-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-red-500"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Pending Payments
                </p>
                <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2 font-outfit">
                  ₹{dashboardData.pendingPayments.toLocaleString("en-IN")}
                </h2>
              </div>
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl group-hover:bg-rose-600 group-hover:text-white transition-all duration-300">
                <FaMoneyBillWave className="text-2xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-slate-400 dark:text-slate-500">
              <span>Awaiting transaction</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 p-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-purple-500"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Active Sites
                </p>
                <h2 className="text-4xl font-extrabold text-slate-800 dark:text-white mt-2 font-outfit">
                  {dashboardData.totalSites}
                </h2>
              </div>
              <div className="p-3 bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 rounded-xl group-hover:bg-violet-600 group-hover:text-white transition-all duration-300">
                <FaBuilding className="text-2xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-slate-400 dark:text-slate-500">
              <span>Ongoing projects</span>
            </div>
          </div>

          {/* Card 5 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 p-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Monthly Payroll
                </p>
                <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2 font-outfit">
                  ₹{dashboardData.monthlyPayroll.toLocaleString("en-IN")}
                </h2>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                <FaMoneyBillWave className="text-2xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-slate-400 dark:text-slate-500">
              <span>Current month payroll</span>
            </div>
          </div>
        </div>

        {/* Dynamic Lists Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Recent Attendance */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-700/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <FaHistory className="text-lg" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white font-outfit">
                  Recent Attendance
                </h2>
              </div>
              <span className="text-xs font-semibold bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 px-2 py-1 rounded">
                Latest Entries
              </span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
              {dashboardData.recentAttendance && dashboardData.recentAttendance.length > 0 ? (
                dashboardData.recentAttendance.map((attendance) => (
                  <div
                    key={attendance._id}
                    className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 p-4 rounded-xl transition-all duration-200 border border-slate-100 dark:border-slate-800"
                  >
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                        {attendance.labour?.name ||
                          attendance.labourName ||
                          "Deleted Labour"}
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {new Date(attendance.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        attendance.status === "Present"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50"
                          : "bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/50"
                      }`}
                    >
                      {attendance.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-400">
                  No attendance records found.
                </div>
              )}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-700/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-lg">
                  <FaMoneyBillWave className="text-lg" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white font-outfit">
                  Recent Payments
                </h2>
              </div>
              <span className="text-xs font-semibold bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 px-2 py-1 rounded">
                Salary Records
              </span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
              {dashboardData.recentPayments && dashboardData.recentPayments.length > 0 ? (
                dashboardData.recentPayments.map((payment) => (
                  <div
                    key={payment._id}
                    className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 p-4 rounded-xl transition-all duration-200 border border-slate-100 dark:border-slate-800"
                  >
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                        {payment.labour?.name ||
                          payment.labourName ||
                          "Deleted Labour"}
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        Salary for {payment.month} {payment.year}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-slate-800 dark:text-slate-200 text-sm font-outfit">
                        ₹{payment.totalSalary.toLocaleString("en-IN")}
                      </p>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${
                          payment.paymentStatus === "Paid"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50"
                            : "bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/50"
                        }`}
                      >
                        {payment.paymentStatus}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-400 col-span-2">
                  No payment records found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;