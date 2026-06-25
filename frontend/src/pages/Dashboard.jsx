import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import AnimatedCounter from "../components/AnimatedCounter";

import {
  FaUsers,
  FaClipboardCheck,
  FaMoneyBillWave,
  FaBuilding,
  FaHistory,
  FaArrowRight,
  FaUserPlus,
  FaReceipt,
  FaClipboardList,
} from "react-icons/fa";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalLabours: 0,
    totalAttendance: 0,
    pendingPayments: 0,
    totalSites: 0,
    monthlyPayroll: 0,
    recentAttendance: [],
    recentPayments: [],
  });

  const [sites, setSites] = useState([]);
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animateWidths, setAnimateWidths] = useState(false);

  useEffect(() => {
    fetchDashboard();
    fetchSitesAndChallans();
  }, []);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setAnimateWidths(true), 150);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const fetchDashboard = async () => {
    try {
      const res = await API.get("/dashboard");
      setDashboardData(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchSitesAndChallans = async () => {
    try {
      const [sitesRes, challansRes] = await Promise.all([
        API.get("/sites"),
        API.get("/challans"),
      ]);
      setSites(sitesRes.data);
      setChallans(challansRes.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getSiteExpenses = () => {
    const expensesMap = {};
    challans.forEach((c) => {
      if (c.items && c.items.length > 0) {
        c.items.forEach((item) => {
          const itemName = item.site?.name?.toLowerCase().trim() || c.site?.name?.toLowerCase().trim();
          const itemAmount = Number(item.amount) || (Number(item.qty || 0) * Number(item.rate || 0));
          
          if (itemName) {
            expensesMap[itemName] = (expensesMap[itemName] || 0) + itemAmount;
          } else {
            const itemSiteId = item.site?._id || item.site || c.site?._id || c.site;
            if (itemSiteId) {
              const key = itemSiteId.toString().toLowerCase();
              expensesMap[key] = (expensesMap[key] || 0) + itemAmount;
            }
          }
        });
      } else {
        const siteName = c.site?.name?.toLowerCase().trim();
        if (siteName) {
          expensesMap[siteName] = (expensesMap[siteName] || 0) + (c.totalAmount || 0);
        } else {
          const siteId = c.site?._id || c.site;
          if (siteId) {
            const key = siteId.toString().toLowerCase();
            expensesMap[key] = (expensesMap[key] || 0) + (c.totalAmount || 0);
          }
        }
      }
    });

    return sites
      .map((site) => {
        const nameKey = site.name.toLowerCase().trim();
        const idKey = site._id.toString().toLowerCase();
        return {
          id: site._id,
          name: site.name,
          expense: expensesMap[nameKey] || expensesMap[idKey] || 0,
        };
      })
      .sort((a, b) => b.expense - a.expense)
      .slice(0, 5); // Top 5 sites
  };

  const topExpenses = getSiteExpenses();
  const totalAllExpenses = challans.reduce((sum, c) => sum + (c.totalAmount || 0), 0);

  return (
    <MainLayout>
      <div className="p-8 max-w-7xl mx-auto animate-fade-in-up">
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-outfit">
              Dashboard Overview
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Welcome back to VC Dreams Contractor ERP portal.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
              <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 mr-2 animate-pulse"></span>
              Live Database Connected
            </span>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="mb-10 animate-fade-in">
          <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-outfit mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              to="/attendance"
              className="group bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 hover:border-emerald-500/40 p-6 rounded-3xl transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                  <FaClipboardList className="text-lg" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    Record Attendance
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Log today's hours
                  </p>
                </div>
              </div>
              <FaArrowRight className="text-slate-400 dark:text-slate-600 group-hover:text-slate-700 dark:group-hover:text-slate-300 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/site-expenses"
              className="group bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 hover:border-blue-500/40 p-6 rounded-3xl transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <FaReceipt className="text-lg" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    Log Site Expense
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Record supply challans
                  </p>
                </div>
              </div>
              <FaArrowRight className="text-slate-400 dark:text-slate-600 group-hover:text-slate-700 dark:group-hover:text-slate-300 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/payroll"
              className="group bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 hover:border-violet-500/40 p-6 rounded-3xl transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 rounded-2xl group-hover:bg-violet-600 group-hover:text-white transition-all duration-300">
                  <FaMoneyBillWave className="text-lg" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    Manage Payroll
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Wages & payouts
                  </p>
                </div>
              </div>
              <FaArrowRight className="text-slate-400 dark:text-slate-600 group-hover:text-slate-700 dark:group-hover:text-slate-300 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/labours"
              className="group bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 hover:border-indigo-500/40 p-6 rounded-3xl transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <FaUserPlus className="text-lg" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    Add Labourer
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Register new worker
                  </p>
                </div>
              </div>
              <FaArrowRight className="text-slate-400 dark:text-slate-600 group-hover:text-slate-700 dark:group-hover:text-slate-300 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
          {/* Card 1 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/40 dark:border-slate-800/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Total Labours
                </p>
                <h2 className="text-4xl font-extrabold text-slate-800 dark:text-white mt-2 font-outfit">
                  <AnimatedCounter value={dashboardData.totalLabours} formatter={(v) => v} />
                </h2>
              </div>
              <div className="p-3 bg-blue-50/60 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <FaUsers className="text-lg" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
              <span>Registered workforce</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/40 dark:border-slate-800/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Present Today
                </p>
                <h2 className="text-4xl font-extrabold text-slate-800 dark:text-white mt-2 font-outfit">
                  <AnimatedCounter value={dashboardData.totalAttendance} formatter={(v) => v} />
                </h2>
              </div>
              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                <FaClipboardCheck className="text-lg" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
              <span>Active attendance</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/40 dark:border-slate-800/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-red-500"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Pending Payments
                </p>
                <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2 font-outfit">
                  ₹<AnimatedCounter value={dashboardData.pendingPayments} />
                </h2>
              </div>
              <div className="p-3 bg-rose-50/60 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl group-hover:bg-rose-600 group-hover:text-white transition-all duration-300">
                <FaMoneyBillWave className="text-lg" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
              <span>Awaiting transaction</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/40 dark:border-slate-800/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-purple-500"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Active Sites
                </p>
                <h2 className="text-4xl font-extrabold text-slate-800 dark:text-white mt-2 font-outfit">
                  <AnimatedCounter value={dashboardData.totalSites} formatter={(v) => v} />
                </h2>
              </div>
              <div className="p-3 bg-violet-50/60 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 rounded-2xl group-hover:bg-violet-600 group-hover:text-white transition-all duration-300">
                <FaBuilding className="text-lg" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
              <span>Ongoing projects</span>
            </div>
          </div>

          {/* Card 5 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/40 dark:border-slate-800/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Monthly Payroll
                </p>
                <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2 font-outfit">
                  ₹<AnimatedCounter value={dashboardData.monthlyPayroll} />
                </h2>
              </div>
              <div className="p-3 bg-amber-50/60 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                <FaMoneyBillWave className="text-lg" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
              <span>Current month payroll</span>
            </div>
          </div>
        </div>

        {/* Analytics Distribution Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Site Expense Distribution */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/40 dark:border-slate-800/60 shadow-sm p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/60">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white font-outfit">
                Site Expenses Distribution
              </h2>
              <span className="text-xs font-bold bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-xl border border-slate-200/30 dark:border-slate-800/40 uppercase tracking-wide font-outfit">
                Top 5 Project Budgets
              </span>
            </div>

            <div className="space-y-4 font-semibold">
              {!loading && topExpenses.length > 0 ? (
                topExpenses.map((se, index) => {
                  const percentage = totalAllExpenses > 0 ? ((se.expense / totalAllExpenses) * 100).toFixed(1) : 0;
                  const gradients = [
                    "from-emerald-500 to-teal-600",
                    "from-blue-500 to-indigo-600",
                    "from-violet-500 to-purple-600",
                    "from-amber-500 to-orange-600",
                    "from-pink-500 to-rose-600"
                  ];
                  const activeGradient = gradients[index % gradients.length];
                  return (
                    <div key={se.id} className="space-y-2 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-all duration-300 transform hover:translate-x-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{se.name}</span>
                        <div className="space-x-2 text-xs">
                          <span className="text-slate-400 dark:text-slate-500">{percentage}% of total</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-100 font-outfit">
                            ₹{se.expense.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800/80 h-3 rounded-full overflow-hidden">
                        <div
                          className={`bg-gradient-to-r ${activeGradient} h-full rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: animateWidths ? `${percentage}%` : "0%" }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-slate-400">
                  {loading ? "Calculating budget values..." : "No expense challans found."}
                </div>
              )}
            </div>
          </div>

          {/* Financial Breakdown card */}
          <div className="bg-slate-900 dark:bg-slate-950 rounded-3xl border border-slate-850 dark:border-slate-900 shadow-xl p-8 text-white flex flex-col justify-between relative overflow-hidden group">
            {/* Absolute background accent */}
            <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/5 rounded-full blur-xl group-hover:scale-150 transition-all duration-500"></div>
            
            <div>
              <span className="text-[10px] uppercase tracking-widest font-black text-indigo-400">
                ERP Analytics Suite
              </span>
              <h3 className="text-2xl font-bold font-outfit mt-2">
                Operational Capital
              </h3>
              <p className="text-slate-400 text-xs mt-1.5 font-medium leading-relaxed">
                Summing active payroll payouts & supply delivery expenses.
              </p>
            </div>

            <div className="my-8 space-y-4">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-slate-400">Material/Paint Deliveries:</span>
                <span className="font-bold font-outfit">₹<AnimatedCounter value={totalAllExpenses} /></span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-white/5 pt-3 font-semibold">
                <span className="text-slate-400">Employee Wages:</span>
                <span className="font-bold font-outfit">₹<AnimatedCounter value={dashboardData.monthlyPayroll} /></span>
              </div>
            </div>

            <div className="border-t border-white/5 pt-5 flex justify-between items-end">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">
                  Combined Outlay
                </span>
                <h4 className="text-3xl font-black font-outfit text-amber-300 mt-1">
                  ₹<AnimatedCounter value={totalAllExpenses + dashboardData.monthlyPayroll} />
                </h4>
              </div>
              <span className="text-xs px-3 py-1.5 rounded-xl bg-white/5 text-white font-bold border border-white/10 tracking-wide uppercase">
                Audit Ready
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Lists Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Recent Attendance */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/40 dark:border-slate-800/60 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <FaHistory className="text-lg" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white font-outfit">
                  Recent Attendance
                </h2>
              </div>
              <span className="text-xs font-bold bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-xl uppercase tracking-wider font-outfit border border-slate-200/30 dark:border-slate-850">
                Latest Entries
              </span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
              {dashboardData.recentAttendance && dashboardData.recentAttendance.length > 0 ? (
                dashboardData.recentAttendance.map((attendance) => (
                  <div
                    key={attendance._id}
                    className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/40 p-4 rounded-2xl transition-all duration-200 border border-slate-100 dark:border-slate-850"
                  >
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
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
                      className={
                        attendance.status === "Present"
                          ? "badge-present animate-fade-in"
                          : attendance.status === "Absent"
                          ? "badge-absent animate-fade-in"
                          : "badge-halfday animate-fade-in"
                      }
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
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/40 dark:border-slate-800/60 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
                  <FaMoneyBillWave className="text-lg" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white font-outfit">
                  Recent Payments
                </h2>
              </div>
              <span className="text-xs font-bold bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-xl uppercase tracking-wider font-outfit border border-slate-200/30 dark:border-slate-850">
                Salary Records
              </span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
              {dashboardData.recentPayments && dashboardData.recentPayments.length > 0 ? (
                dashboardData.recentPayments.map((payment) => (
                  <div
                    key={payment._id}
                    className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/40 p-4 rounded-2xl transition-all duration-200 border border-slate-100 dark:border-slate-850"
                  >
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                        {payment.labour?.name ||
                          payment.labourName ||
                          "Deleted Labour"}
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        Salary for {payment.month} {payment.year}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-slate-850 dark:text-slate-200 text-sm font-outfit">
                        ₹{payment.totalSalary.toLocaleString("en-IN")}
                      </p>
                      <span
                        className={
                          payment.paymentStatus === "Paid"
                            ? "badge-present animate-fade-in text-[10px] py-0.5 px-2 mt-1"
                            : "badge-halfday animate-fade-in text-[10px] py-0.5 px-2 mt-1"
                        }
                      >
                        {payment.paymentStatus}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-400">
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