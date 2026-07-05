import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Building2,
  Users,
  Coins,
  Receipt,
  Plus,
  Trash2,
  Calendar,
  TrendingUp,
  TrendingDown,
  FileCheck,
  Briefcase,
  X,
  CreditCard,
  UserCheck,
  MapPin,
  Clock,
  Sparkles,
  Info
} from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import API from "../services/api";
import { formatDate } from "../utils/dateFormatter";
import AnimatedCounter from "../components/AnimatedCounter";
import toast from "react-hot-toast";

const SitePayroll = () => {
  const monthsList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const yearsList = ["2025", "2026", "2027"];

  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("labour");

  // Date filters
  const dateObj = new Date();
  const [selectedMonth, setSelectedMonth] = useState(monthsList[dateObj.getUTCMonth()]);
  const [selectedYear, setSelectedYear] = useState(String(dateObj.getUTCFullYear()));

  // Detailed site data
  const [attendance, setAttendance] = useState([]);
  const [challans, setChallans] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [payrolls, setPayrolls] = useState([]);

  // Modals & Loaders
  const [showTxModal, setShowTxModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // New Transaction Form State
  const [txForm, setTxForm] = useState({
    type: "Payment Received",
    amount: "",
    partyName: "",
    reference: "",
    description: "",
    date: new Date().toISOString().split("T")[0]
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const res = await API.get("/sites");
      const activeSites = res.data.filter(s => s.status !== "Deleted");
      setSites(activeSites);
      if (activeSites.length > 0) {
        setSelectedSite(activeSites[0]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load sites.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSite) {
      fetchSiteDetails(selectedSite._id);
    }
  }, [selectedSite]);

  const fetchSiteDetails = async (siteId) => {
    try {
      const [attRes, challanRes, txRes, payrollRes] = await Promise.all([
        API.get(`/reports/attendance?site=${siteId}`),
        API.get("/challans"),
        API.get(`/site-transactions/site/${siteId}`),
        API.get("/payroll")
      ]);

      // Filter attendance records for this site
      const siteAtt = (attRes.data || []).filter(r => r.site?._id === siteId);
      setAttendance(siteAtt);

      // Filter challans for this site
      const siteChallans = (challanRes.data || []).filter(c => c.site?._id === siteId);
      setChallans(siteChallans);

      setTransactions(txRes.data || []);
      setPayrolls(payrollRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load details for this site.");
    }
  };

  // Monthly filtered datasets
  const getFilteredAttendance = () => {
    return attendance.filter(r => {
      const d = new Date(r.date);
      const m = monthsList[d.getUTCMonth()];
      const y = String(d.getUTCFullYear());
      return m === selectedMonth && y === selectedYear;
    });
  };

  const getFilteredChallans = () => {
    return challans.filter(c => {
      const d = new Date(c.billDate);
      const m = monthsList[d.getUTCMonth()];
      const y = String(d.getUTCFullYear());
      return m === selectedMonth && y === selectedYear;
    });
  };

  const getFilteredTransactions = () => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      const m = monthsList[d.getUTCMonth()];
      const y = String(d.getUTCFullYear());
      return m === selectedMonth && y === selectedYear;
    });
  };

  const filteredAttendance = getFilteredAttendance();
  const filteredChallans = getFilteredChallans();
  const filteredTransactions = getFilteredTransactions();

  // Group attendance by worker to show individual worker totals
  const getLabourPayroll = () => {
    const map = {};
    filteredAttendance.forEach(r => {
      const workerId = r.labour?._id || "unknown";
      const name = r.labour?.name || r.labourName || "Deleted Labour";
      const dailyWage = r.labour?.dailyWage || 0;

      if (!map[workerId]) {
        map[workerId] = {
          id: workerId,
          name,
          dailyWage,
          presentDays: 0,
          halfDays: 0,
          overtime: 0,
          teaExpense: 0,
          bhada: 0,
          advance: 0
        };
      }

      if (r.status === "Present") {
        map[workerId].presentDays++;
      } else if (r.status === "Half Day") {
        map[workerId].halfDays++;
      }
      map[workerId].overtime += r.overtime || r.nightShift || 0;
      map[workerId].teaExpense += r.teaExpense || 0;
      map[workerId].bhada += r.bhada || 0;
      map[workerId].advance += r.advance || 0;
    });

    return Object.values(map).map(w => {
      // Overtime calculation: hourly (wage / 4) * hours
      const otWage = w.overtime * (w.dailyWage / 4);
      const grossWage = (w.presentDays * w.dailyWage) + (w.halfDays * (w.dailyWage / 2)) + otWage + w.teaExpense + w.bhada;
      
      // Lookup payroll status for this worker, month and year
      const workerPayroll = payrolls.find(p => 
        p.labour?._id === w.id && 
        p.month === selectedMonth && 
        p.year === Number(selectedYear)
      );

      return {
        ...w,
        grossWage,
        netWage: grossWage - w.advance,
        paymentStatus: workerPayroll ? workerPayroll.paymentStatus : "Unscheduled"
      };
    });
  };

  const labourPayroll = getLabourPayroll();

  // Aggregate stats based on active month filters
  const totalLabourCost = labourPayroll.reduce((sum, w) => sum + w.grossWage, 0);
  const totalVendorCost = filteredChallans.reduce((sum, c) => sum + (c.totalAmount || 0), 0);
  const totalPaymentsReceived = filteredTransactions
    .filter(t => t.type === "Payment Received")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const siteBalance = totalPaymentsReceived - totalLabourCost - totalVendorCost;

  // Filtered Sites list
  const filteredSites = sites.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contractorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    if (!txForm.amount || !txForm.partyName) {
      toast.error("Please fill in required fields.");
      return;
    }

    try {
      const payload = {
        ...txForm,
        site: selectedSite._id,
        amount: Number(txForm.amount)
      };
      await API.post("/site-transactions", payload);
      toast.success("Transaction logged successfully!");
      setShowTxModal(false);
      // Reset form
      setTxForm({
        type: "Payment Received",
        amount: "",
        partyName: "",
        reference: "",
        description: "",
        date: new Date().toISOString().split("T")[0]
      });
      fetchSiteDetails(selectedSite._id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save transaction.");
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction record?")) {
      try {
        await API.delete(`/site-transactions/${id}`);
        toast.success("Transaction deleted successfully");
        fetchSiteDetails(selectedSite._id);
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete transaction.");
      }
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-outfit">
              Site Financials & Payouts
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-xs font-medium">
              Manage client billing, materials vendor transactions, and workforce costs per project site.
            </p>
          </div>

          {selectedSite && (
            <button
              onClick={() => setShowTxModal(true)}
              className="btn-primary-premium flex items-center justify-center gap-2 text-xs self-start"
            >
              <Plus className="w-4 h-4" />
              <span>Log Transaction</span>
            </button>
          )}
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-650"></div>
          </div>
        ) : sites.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-16 rounded-[24px] text-center max-w-md mx-auto">
            <Building2 className="w-16 h-16 text-slate-350 mx-auto mb-4 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 font-outfit uppercase tracking-wider">No Active Sites Found</h3>
            <p className="text-slate-400 text-xs mt-1">Please register active sites under Site Management.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: SITE NAVIGATION LIST */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl shadow-xs p-3.5 flex items-center gap-3 transition-all focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500/80">
                <Search className="text-slate-400 w-4 h-4 shrink-0" />
                <input
                  type="text"
                  placeholder="Search site, contractor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent outline-none text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400"
                />
              </div>

              <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1 custom-scrollbar">
                {filteredSites.map((site) => {
                  const isSelected = selectedSite && selectedSite._id === site._id;
                  const initials = site.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                  const hue = (site.name.charCodeAt(0) || 0) % 360;

                  return (
                    <div
                      key={site._id}
                      onClick={() => setSelectedSite(site)}
                      className={`p-4 rounded-2xl border text-left cursor-pointer transition-all duration-200 relative overflow-hidden ${
                        isSelected
                          ? "bg-slate-50 dark:bg-slate-850/40 border-[#0B2C6F]/40 dark:border-indigo-500/30 shadow-xs"
                          : "bg-white dark:bg-slate-900 border-slate-200/50 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-850/10"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#0B2C6F] dark:bg-indigo-500" />
                      )}
                      <div className="flex items-center gap-4">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[10px] font-black shrink-0 shadow-sm"
                          style={{ background: `linear-gradient(135deg, hsl(${hue}, 60%, 45%) 0%, hsl(${hue}, 70%, 55%) 100%)` }}
                        >
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-white font-outfit uppercase tracking-wider truncate">
                            {site.name}
                          </h4>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5 truncate">
                            Contractor: {site.contractorName || "N/A"}
                          </p>
                        </div>
                        <span className="inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50 shrink-0">
                          {site.progress || 0}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: SITE METRICS & WORKSPACE */}
            {selectedSite && (
              <div className="lg:col-span-8 space-y-6">
                
                {/* ACTIVE SITE SUMMARY HEADER */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-[24px] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white font-outfit uppercase tracking-wide">
                        {selectedSite.name}
                      </h2>
                      <span className="inline-flex items-center text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50 uppercase">
                        {selectedSite.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-450 dark:text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        Contractor: {selectedSite.contractorName || "N/A"}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {selectedSite.location}
                      </span>
                    </div>
                  </div>

                  {/* Monthly date selectors */}
                  <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-150 dark:border-slate-850">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0" />
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="bg-transparent text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
                    >
                      {monthsList.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <span className="text-slate-300 dark:text-slate-800 font-bold">|</span>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="bg-transparent text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
                    >
                      {yearsList.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>

                {/* SITE CARD STATS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <MiniStatCard
                    title="Labour Cost"
                    value={totalLabourCost}
                    subtext={`${selectedMonth} cost`}
                    icon={<Users className="w-4 h-4 text-indigo-500" />}
                    accent="border-indigo-500"
                  />
                  <MiniStatCard
                    title="Material Bills"
                    value={totalVendorCost}
                    subtext="Challan totals"
                    icon={<Receipt className="w-4 h-4 text-amber-500" />}
                    accent="border-amber-500"
                  />
                  <MiniStatCard
                    title="Received"
                    value={totalPaymentsReceived}
                    subtext="Ledger payments"
                    icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}
                    accent="border-emerald-500"
                  />
                  <MiniStatCard
                    title="Site Balance"
                    value={siteBalance}
                    subtext="Net monthly profit"
                    icon={siteBalance >= 0 ? <TrendingUp className="w-4 h-4 text-sky-500" /> : <TrendingDown className="w-4 h-4 text-rose-500" />}
                    accent={siteBalance >= 0 ? "border-sky-500" : "border-rose-500"}
                    isProfit={true}
                  />
                </div>

                {/* TABS CONTAINER */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-[24px] p-6 shadow-sm space-y-6">
                  
                  {/* TAB SWITCHES */}
                  <div className="flex border-b border-slate-100 dark:border-slate-800 pb-3 gap-2 overflow-x-auto">
                    <TabSwitch
                      id="labour"
                      label="Labour Wages"
                      count={labourPayroll.length}
                      icon={<Users className="w-4 h-4" />}
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                    />
                    <TabSwitch
                      id="vendor"
                      label="Material Bills"
                      count={filteredChallans.length}
                      icon={<Receipt className="w-4 h-4" />}
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                    />
                    <TabSwitch
                      id="ledger"
                      label="Transaction Ledger"
                      count={filteredTransactions.length}
                      icon={<CreditCard className="w-4 h-4" />}
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                    />
                  </div>

                  {/* TAB ACTIONS */}
                  <AnimatePresence mode="wait">
                    {activeTab === "labour" && (
                      <motion.div
                        key="labour"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-4"
                      >
                        {labourPayroll.length === 0 ? (
                          <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                            <Users className="w-10 h-10 mx-auto mb-2 text-slate-350 dark:text-slate-700" />
                            <p className="text-xs font-bold uppercase tracking-wider font-outfit">No labour checks logged for {selectedMonth} {selectedYear}</p>
                          </div>
                        ) : (
                          <div className="border border-slate-200/50 dark:border-slate-800/85 rounded-2xl overflow-hidden shadow-xs">
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse min-w-[800px]">
                                <thead>
                                  <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200/50 dark:border-slate-800 text-[10px] tracking-wider uppercase font-bold text-slate-450 dark:text-slate-500 font-outfit">
                                    <th className="px-5 py-4 text-left">Worker Name</th>
                                    <th className="px-5 py-4 text-right">Daily Rate</th>
                                    <th className="px-5 py-4 text-right">Presents</th>
                                    <th className="px-5 py-4 text-right">Half Days</th>
                                    <th className="px-5 py-4 text-right">OT Hrs</th>
                                    <th className="px-5 py-4 text-right">Tea/Bhada</th>
                                    <th className="px-5 py-4 text-right">Advance</th>
                                    <th className="px-5 py-4 text-center">Status</th>
                                    <th className="px-5 py-4 text-right">Total Cost</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                                  {labourPayroll.map((w, idx) => {
                                    const workerInitials = w.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                                    const workerHue = (w.name.charCodeAt(0) || 0) % 360;

                                    return (
                                      <tr key={idx} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors text-xs font-semibold text-slate-700 dark:text-slate-350">
                                        <td className="px-5 py-3.5">
                                          <div className="flex items-center gap-3">
                                            <div
                                              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[9px] font-black shrink-0 shadow-sm"
                                              style={{ background: `hsl(${workerHue}, 65%, 52%)` }}
                                            >
                                              {workerInitials}
                                            </div>
                                            <span className="font-bold text-slate-900 dark:text-white font-outfit whitespace-nowrap">{w.name}</span>
                                          </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-medium">{w.dailyWage}</td>
                                        <td className="px-5 py-3.5 text-right text-emerald-600 dark:text-emerald-400 font-bold">{w.presentDays}</td>
                                        <td className="px-5 py-3.5 text-right text-amber-500 font-bold">{w.halfDays}</td>
                                        <td className="px-5 py-3.5 text-right text-blue-500 font-bold">{w.overtime}h</td>
                                        <td className="px-5 py-3.5 text-right">{w.teaExpense + w.bhada}</td>
                                        <td className="px-5 py-3.5 text-right text-rose-500 font-bold">{w.advance || 0}</td>
                                        <td className="px-5 py-3.5 text-center">
                                          <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full border uppercase ${
                                            w.paymentStatus === "Paid"
                                              ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-250/40"
                                              : w.paymentStatus === "Pending"
                                                ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-250/40"
                                                : "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200/50 dark:border-slate-700/50"
                                          }`}>
                                            <span className={`w-1 h-1 rounded-full ${
                                              w.paymentStatus === "Paid" ? "bg-emerald-500" : w.paymentStatus === "Pending" ? "bg-amber-500" : "bg-slate-400"
                                            }`} />
                                            {w.paymentStatus}
                                          </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-black text-slate-900 dark:text-white font-outfit">
                                          {w.grossWage}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                                <tfoot>
                                  <tr className="bg-slate-50/30 dark:bg-slate-900/30 border-t border-slate-200/60 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-white font-outfit">
                                    <td className="px-5 py-4 font-bold text-left uppercase">Totals</td>
                                    <td></td>
                                    <td className="px-5 py-4 text-right text-emerald-600 dark:text-emerald-400">{labourPayroll.reduce((sum, w) => sum + w.presentDays, 0)}</td>
                                    <td className="px-5 py-4 text-right text-amber-500">{labourPayroll.reduce((sum, w) => sum + w.halfDays, 0)}</td>
                                    <td className="px-5 py-4 text-right text-blue-500">{labourPayroll.reduce((sum, w) => sum + w.overtime, 0)}h</td>
                                    <td className="px-5 py-4 text-right">{labourPayroll.reduce((sum, w) => sum + (w.teaExpense + w.bhada), 0)}</td>
                                    <td className="px-5 py-4 text-right text-rose-500">{labourPayroll.reduce((sum, w) => sum + w.advance, 0)}</td>
                                    <td></td>
                                    <td className="px-5 py-4 text-right font-black text-slate-900 dark:text-white">{totalLabourCost}</td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {activeTab === "vendor" && (
                      <motion.div
                        key="vendor"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-4"
                      >
                        {filteredChallans.length === 0 ? (
                          <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                            <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-350 dark:text-slate-700" />
                            <p className="text-xs font-bold uppercase tracking-wider font-outfit">No material bills logged for {selectedMonth} {selectedYear}</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredChallans.map((c) => (
                              <div
                                key={c._id}
                                className="p-5 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-2xl flex flex-col justify-between hover:border-indigo-500/25 transition-all shadow-xs"
                              >
                                <div>
                                  <div className="flex justify-between items-start">
                                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-lg border border-indigo-150/40">
                                      Challan: {c.challanNo}
                                    </span>
                                    <span className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold">{formatDate(c.billDate)}</span>
                                  </div>
                                  <h4 className="text-sm font-bold text-slate-900 dark:text-white font-outfit mt-3">
                                    Vendor: {c.vendor}
                                  </h4>
                                  
                                  {/* Item tags */}
                                  <div className="flex flex-wrap gap-1.5 mt-3">
                                    {c.items?.map((item, i) => (
                                      <span
                                        key={i}
                                        className="inline-flex text-[9px] font-bold bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 px-2 py-0.5 rounded-lg text-slate-500 dark:text-slate-400"
                                      >
                                        {item.itemName} ({item.qty} Ltr)
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div className="border-t border-slate-100 dark:border-slate-850 mt-4 pt-3 flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Bill Value</span>
                                  <span className="text-xs font-black text-indigo-650 dark:text-indigo-400 font-outfit">
                                    {c.totalAmount || 0}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}

                    {activeTab === "ledger" && (
                      <motion.div
                        key="ledger"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-4"
                      >
                        {filteredTransactions.length === 0 ? (
                          <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                            <CreditCard className="w-10 h-10 mx-auto mb-2 text-slate-350 dark:text-slate-700" />
                            <p className="text-xs font-bold uppercase tracking-wider font-outfit">No transactions logged for {selectedMonth} {selectedYear}</p>
                          </div>
                        ) : (
                          <div className="border border-slate-200/50 dark:border-slate-800/85 rounded-2xl overflow-hidden shadow-xs">
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse min-w-[750px]">
                                <thead>
                                  <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200/50 dark:border-slate-800 text-[10px] tracking-wider uppercase font-bold text-slate-450 dark:text-slate-500 font-outfit">
                                    <th className="px-5 py-4 text-left">Date</th>
                                    <th className="px-5 py-4 text-left">Type</th>
                                    <th className="px-5 py-4 text-left">Party Name</th>
                                    <th className="px-5 py-4 text-left">Ref Code</th>
                                    <th className="px-5 py-4 text-left">Description</th>
                                    <th className="px-5 py-4 text-right">Amount</th>
                                    <th className="px-5 py-4 text-center w-10"></th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                                  {filteredTransactions.map((tx) => (
                                    <tr key={tx._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors text-xs font-semibold text-slate-700 dark:text-slate-350">
                                      <td className="px-5 py-3.5 whitespace-nowrap">{formatDate(tx.date)}</td>
                                      <td className="px-5 py-3.5 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                          tx.type === "Payment Received"
                                            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-250/30"
                                            : tx.type === "Vendor Payout"
                                              ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-250/30"
                                              : "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border-indigo-250/30"
                                        }`}>
                                          <span className={`w-1 h-1 rounded-full ${
                                            tx.type === "Payment Received" ? "bg-emerald-500" : tx.type === "Vendor Payout" ? "bg-amber-500" : "bg-indigo-500"
                                          }`} />
                                          {tx.type}
                                        </span>
                                      </td>
                                      <td className="px-5 py-3.5 font-bold text-slate-850 dark:text-slate-200">{tx.partyName}</td>
                                      <td className="px-5 py-3.5 font-medium text-slate-450">{tx.reference || "N/A"}</td>
                                      <td className="px-5 py-3.5 text-slate-400 italic max-w-[150px] truncate">{tx.description || "-"}</td>
                                      <td className={`px-5 py-3.5 text-right font-black font-outfit text-sm ${
                                        tx.type === "Payment Received" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-455"
                                      }`}>
                                        {tx.type === "Payment Received" ? "+" : "-"}{tx.amount}
                                      </td>
                                      <td className="px-5 py-3.5 text-center">
                                        <button
                                          onClick={() => handleDeleteTransaction(tx._id)}
                                          className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-955/20 p-1.5 rounded-xl transition-all"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot>
                                  <tr className="bg-slate-50/30 dark:bg-slate-900/30 border-t border-slate-200/60 dark:border-slate-800 text-xs font-bold text-slate-855 dark:text-white font-outfit">
                                    <td className="px-5 py-4 font-bold text-left uppercase" colSpan={5}>Ledger Summary</td>
                                    <td className="px-5 py-4 text-right text-slate-900 dark:text-white">
                                      In: {totalPaymentsReceived} / Out: {filteredTransactions.filter(t => t.type !== "Payment Received").reduce((sum, t) => sum + t.amount, 0)}
                                    </td>
                                    <td></td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        )}

        {/* LOG TRANSACTION MODAL */}
        <AnimatePresence>
          {showTxModal && (
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-start justify-center z-50 p-4 pt-[10vh] md:pt-[12vh] overflow-y-auto animate-fade-in">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-auto md:my-0"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold font-outfit">Log Site Transaction</h2>
                    <p className="text-slate-400 text-[10px] mt-0.5">Manage inflows/outflows for {selectedSite?.name}</p>
                  </div>
                  <button
                    onClick={() => setShowTxModal(false)}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all active:scale-95"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleCreateTransaction} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider">Transaction Type</label>
                      <select
                        value={txForm.type}
                        onChange={(e) => setTxForm({ ...txForm, type: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl px-4 py-3 text-xs font-bold text-slate-750 dark:text-slate-300"
                      >
                        <option value="Payment Received">Payment Received (Client)</option>
                        <option value="Vendor Payout">Vendor Payout (Materials)</option>
                        <option value="Labour Payout">Labour Payout (Wages)</option>
                        <option value="Other Expense">Other Expense</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider">Amount</label>
                      <input
                        type="number"
                        placeholder="Amount"
                        value={txForm.amount}
                        onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl px-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider">Party/Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Contractor Name, Vendor Co."
                        value={txForm.partyName}
                        onChange={(e) => setTxForm({ ...txForm, partyName: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl px-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider">Reference Code</label>
                      <input
                        type="text"
                        placeholder="UPI Ref, Cheque No"
                        value={txForm.reference}
                        onChange={(e) => setTxForm({ ...txForm, reference: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl px-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider">Transaction Date</label>
                    <input
                      type="date"
                      value={txForm.date}
                      onChange={(e) => setTxForm({ ...txForm, date: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl px-4 py-3 text-xs font-bold focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider">Description</label>
                    <textarea
                      placeholder="Enter optional description..."
                      value={txForm.description}
                      onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
                      rows={3}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl p-3.5 text-xs font-semibold focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button type="submit" className="flex-1 btn-primary-premium py-3.5 text-xs">
                      Submit Transaction
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowTxModal(false)}
                      className="flex-1 btn-secondary-premium py-3.5 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </MainLayout>
  );
};

const MiniStatCard = ({ title, value, subtext, icon, accent, isProfit = false }) => {
  const isNegative = isProfit && value < 0;
  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-4.5 rounded-[20px] shadow-xs relative overflow-hidden transition-all hover:-translate-y-0.5`}>
      <div className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-[20px] ${accent.replace("border", "bg")}`} />
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest font-outfit">{title}</p>
          <h3 className={`text-base font-black mt-1 font-outfit leading-none ${isNegative ? "text-rose-600 dark:text-rose-455" : "text-slate-900 dark:text-white"}`}>
            <AnimatedCounter value={value} formatter={(v) => v} />
          </h3>
          <p className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-1 leading-snug">{subtext}</p>
        </div>
        <div className="p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850/60 shadow-inner shrink-0">
          {icon}
        </div>
      </div>
    </div>
  );
};

const TabSwitch = ({ id, label, count, icon, activeTab, setActiveTab }) => {
  const isActive = activeTab === id;
  return (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-wider transition-all border shrink-0 ${
        isActive
          ? "bg-[#0B2C6F]/10 dark:bg-indigo-500/15 border-slate-200/40 dark:border-indigo-500/10 text-[#0B2C6F] dark:text-indigo-400"
          : "bg-white dark:bg-slate-900 border-slate-200/50 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
      }`}
    >
      {icon}
      <span>{label}</span>
      <span className={`inline-flex px-1.5 py-0.5 rounded-md text-[9px] font-black ${
        isActive ? "bg-[#0B2C6F]/20 dark:bg-indigo-500/30" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
      }`}>
        {count}
      </span>
    </button>
  );
};

export default SitePayroll;
