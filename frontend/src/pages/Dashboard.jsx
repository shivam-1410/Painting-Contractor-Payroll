import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import {
  Users,
  Building2,
  Coins,
  AlertCircle,
  CalendarDays,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles
} from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import API from "../services/api";
import AnimatedCounter from "../components/AnimatedCounter";
import { formatDate } from "../utils/dateFormatter";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalLabours: 0,
    totalAttendance: 0,
    pendingPayments: 0,
    totalSites: 0,
    monthlyPayroll: 0,
    recentAttendance: [],
    recentPayments: [],
    yearlyTea: 0,
    yearlyBhada: 0,
    yearlyLabourCost: 0,
  });

  const [sites, setSites] = useState([]);
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
    fetchSitesAndChallans();
  }, []);

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
          name: site.name,
          value: expensesMap[nameKey] || expensesMap[idKey] || 0,
        };
      })
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  };

  const activeSitesCount = sites.filter(s => !s.status || s.status.toLowerCase() === "active").length;
  const totalAllExpenses = challans.reduce((sum, c) => sum + (c.totalAmount || 0), 0);
  const pieData = getSiteExpenses().slice(0, 5); // top 5 site expenses

  // Colors for Pie Chart
  const COLORS = ["#0B2C6F", "#2563EB", "#3B82F6", "#60A5FA", "#93C5FD"];

  // Monthly Payroll Trend Data
  const payrollTrendData = [
    { name: "Apr", amount: 0 },
    { name: "May", amount: 0 },
    { name: "Jun", amount: 0 }, // June records deleted
    { name: "Jul", amount: dashboardData.monthlyPayroll || 0 },
  ];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HERO SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-slate-900 via-[#0B2C6F] to-slate-900 text-white p-8 rounded-[24px] shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.1),transparent)] pointer-events-none"></div>
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-300 font-outfit">VC Dreams Portal</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight font-outfit">
              Good Morning, Viral 👋
            </h1>
            <p className="text-slate-300 text-xs font-medium max-w-md">
              Manage labour, payroll and site expenses efficiently. Here is your operational overview.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 relative z-10">
            <span className="inline-flex items-center px-4 py-2 rounded-2xl text-xs font-extrabold tracking-wide uppercase bg-white/10 backdrop-blur-md text-emerald-400 border border-white/15 shadow-sm">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              ERP Connected
            </span>
          </div>
        </div>

        {/* STATISTICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Labour"
            value={dashboardData.totalLabours}
            icon={<Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
            color="border-l-4 border-indigo-600"
            subtext="Registered workers"
          />
          <StatCard
            title="Total Payroll This Month"
            value={dashboardData.monthlyPayroll}
            icon={<Coins className="w-5 h-5 text-emerald-600 dark:text-emerald-450" />}
            color="border-l-4 border-emerald-600"
            subtext="Net monthly payout"
          />
          <StatCard
            title="Active Sites"
            value={activeSitesCount}
            icon={<Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
            color="border-l-4 border-blue-600"
            subtext="Ongoing contractor projects"
          />
          <StatCard
            title="Pending Payments"
            value={dashboardData.pendingPayments}
            icon={<AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-455" />}
            color="border-l-4 border-rose-600"
            subtext="Outstanding payroll balance"
          />
        </div>

        {/* ANNUAL EXPENDITURES BLOCK */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-outfit uppercase tracking-wider">
              Annual Operational Expenditures ({new Date().getFullYear()})
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">
              Year-to-date summary of contractor expenses
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Yearly Tea Cost"
              value={dashboardData.yearlyTea}
              icon={<Sparkles className="w-5 h-5 text-indigo-500" />}
              color="border-l-4 border-indigo-500/80"
              subtext="Annual tea distribution cost"
            />
            <StatCard
              title="Yearly Bhada Cost"
              value={dashboardData.yearlyBhada}
              icon={<TrendingUp className="w-5 h-5 text-amber-500" />}
              color="border-l-4 border-amber-500/80"
              subtext="Annual transport allowances"
            />
            <StatCard
              title="Yearly Labour Cost"
              value={dashboardData.yearlyLabourCost}
              icon={<Users className="w-5 h-5 text-sky-500" />}
              color="border-l-4 border-sky-500/80"
              subtext="Annual gross worker wages"
            />
            <StatCard
              title="Total Annual Outflow"
              value={(dashboardData.yearlyTea || 0) + (dashboardData.yearlyBhada || 0) + (dashboardData.yearlyLabourCost || 0)}
              icon={<Coins className="w-5 h-5 text-violet-500" />}
              color="border-l-4 border-violet-500"
              subtext="Combined annual outflows"
            />
          </div>
        </div>

        {/* CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Payroll Trend Bar Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-[24px] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-outfit uppercase tracking-wider">
                  Monthly Payroll Trend
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">
                  Salary payout comparisons
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-slate-400" />
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={payrollTrendData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      borderRadius: "16px",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  />
                  <Bar dataKey="amount" fill="#2563EB" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Site Expense Breakdown Donut Chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-[24px] p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-outfit uppercase tracking-wider">
                  Site Expense Breakdown
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">
                  Top challan costs per site
                </p>
              </div>
              <Building2 className="w-5 h-5 text-slate-400" />
            </div>
            <div className="h-[180px] relative flex-1 flex items-center justify-center">
              {pieData.length === 0 ? (
                <span className="text-xs text-slate-400 font-bold uppercase">No Expenses Logged</span>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                        borderRadius: "12px",
                        border: "none",
                        color: "#fff",
                        fontSize: "11px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            {pieData.length > 0 && (
              <div className="mt-4 space-y-2">
                {pieData.slice(0, 3).map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index] }}></span>
                      <span className="font-semibold text-slate-650 dark:text-slate-350 truncate max-w-[140px]">{item.name}</span>
                    </div>
                    <span className="font-extrabold text-slate-800 dark:text-white font-outfit">{item.value.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* WIDGETS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Attendance Widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-[24px] p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-outfit uppercase tracking-wider">
                    Recent Attendance
                  </h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                    Latest check-ins
                  </p>
                </div>
              </div>
              <Link to="/attendance-report" className="text-xs text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center gap-1 hover:underline">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-800/80">
              {dashboardData.recentAttendance.length === 0 ? (
                <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase">No check-ins today</div>
              ) : (
                dashboardData.recentAttendance.slice(0, 4).map((att) => (
                  <div key={att._id} className="py-3.5 flex items-center justify-between transition-colors duration-200 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 px-2 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-extrabold text-xs font-outfit">
                        {att.labour?.name?.charAt(0) || "L"}
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-800 dark:text-white leading-tight font-outfit">
                          {att.labour?.name || "Deleted Labour"}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">
                          {formatDate(att.date)}
                        </p>
                      </div>
                    </div>
                    <span className={att.status === "Present" ? "badge-present text-[10px]" : "badge-absent text-[10px]"}>
                      {att.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Latest Receipts Widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-[24px] p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-outfit uppercase tracking-wider">
                    Latest Receipts
                  </h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                    Recent salary sheets
                  </p>
                </div>
              </div>
              <Link to="/receipts" className="text-xs text-emerald-600 dark:text-emerald-450 font-extrabold flex items-center gap-1 hover:underline">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-800/80">
              {dashboardData.recentPayments.length === 0 ? (
                <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase">No payouts generated yet</div>
              ) : (
                dashboardData.recentPayments.slice(0, 4).map((pay) => (
                  <div key={pay._id} className="py-3.5 flex items-center justify-between transition-colors duration-200 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 px-2 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-extrabold text-xs font-outfit border border-emerald-100 dark:border-emerald-900/40">
                        V
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-800 dark:text-white leading-tight font-outfit">
                          {pay.labourName}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">
                          Payroll Month: {pay.month} {pay.year}
                        </p>
                      </div>
                    </div>
                    <span className="font-extrabold text-slate-850 dark:text-white font-outfit text-xs">
                      {pay.totalSalary.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

const StatCard = ({ title, value, icon, color, subtext }) => {
  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-6 rounded-[20px] shadow-sm relative overflow-hidden transition-premium hover:-translate-y-1 hover:shadow-md ${color}`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-slate-100/40 dark:bg-slate-800/10 rounded-full blur-2xl pointer-events-none"></div>
      <div className="flex justify-between items-start">
        <div className="space-y-4">
          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest font-outfit">
              {title}
            </p>
            <h3 className="text-2xl font-black text-slate-855 dark:text-white mt-1.5 font-outfit">
              {typeof value === "number" ? <AnimatedCounter value={value} /> : value}
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">{subtext}</span>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850/60 shadow-inner">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;