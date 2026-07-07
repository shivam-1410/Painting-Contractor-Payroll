import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import {
  Coins,
  CheckCircle2,
  Clock,
  Search,
  Calendar,
  Send,
  FileText,
  Download,
  AlertCircle,
  FileSpreadsheet
} from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import API from "../services/api";
import toast from "react-hot-toast";
import AnimatedCounter from "../components/AnimatedCounter";

const Payroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const res = await API.get("/payroll");
      setPayrolls(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const generatePayroll = async () => {
    if (!month) {
      toast.error("Please select a month to generate payroll");
      return;
    }
    setGenerating(true);
    const loadingToast = toast.loading(`Generating payroll for ${month} ${year}...`);
    try {
      await API.post("/payroll/generate", { month, year });
      toast.success("Payroll Generated Successfully", { id: loadingToast });
      fetchPayrolls();
    } catch (error) {
      console.log(error);
      const msg = error.response?.data?.message || "Failed to generate payroll";
      toast.error(msg, { id: loadingToast });
    } finally {
      setGenerating(false);
    }
  };

  const markAsPaid = async (id) => {
    try {
      await API.put(`/payroll/pay/${id}`);
      toast.success("Payment marked as Paid");
      fetchPayrolls();
    } catch (error) {
      console.log(error);
      toast.error("Failed to mark as paid");
    }
  };

  const markAsPending = async (id) => {
    try {
      await API.put(`/payroll/unpay/${id}`);
      toast.success("Payment marked as Pending (Unsettled)");
      fetchPayrolls();
    } catch (error) {
      console.log(error);
      toast.error("Failed to unsettle payment");
    }
  };

  const handleExportExcel = () => {
    const dataToExport = filteredPayrolls.map((p) => ({
      Labour: p.labour?.name || p.labourName || "Deleted Labour",
      Month: p.month,
      Year: p.year,
      "Daily Wage": p.dailyWage,
      "Present Days": p.presentDays,
      "Half Days": p.halfDays,
      "Overtime (Hrs)": p.overtime,
      "Tea Expense": p.teaExpense,
      Bhada: p.bhada,
      Advance: p.advance,
      "Total Salary": p.totalSalary,
      Status: p.paymentStatus,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payroll Summary");
    XLSX.writeFile(wb, `Payroll_${month || "All"}_${year}.xlsx`);
  };

  const filteredPayrolls = payrolls.filter((p) => {
    const name = p.labour?.name || p.labourName || "";
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = !month || p.month === month;
    const matchesYear = !year || p.year === Number(year);
    return matchesSearch && matchesMonth && matchesYear;
  });

  // Payroll Metrics
  const totalPayout = filteredPayrolls.reduce((sum, p) => sum + p.totalSalary, 0);
  const paidPayout = filteredPayrolls.filter(p => p.paymentStatus === "Paid").reduce((sum, p) => sum + p.totalSalary, 0);
  const pendingPayout = filteredPayrolls.filter(p => p.paymentStatus !== "Paid").reduce((sum, p) => sum + p.totalSalary, 0);

  const getWhatsAppLink = (payroll) => {
    const number = payroll.phone || "";
    const cleanNumber = number.replace(/\D/g, "");
    const text = encodeURIComponent(
      `Hello ${payroll.labourName || "Labourer"},\n\nYour salary receipt for *${payroll.month} ${payroll.year}* is generated successfully.\n\n*Details:*\n` +
      `- Present Days: ${payroll.presentDays}\n` +
      `- Overtime: ${payroll.overtime} Hrs\n` +
      `- Net Salary: ${payroll.totalSalary}\n\n` +
      `Click here to view your complete digital receipt:\nhttps://vcdreams.vercel.app/receipt/${payroll._id}\n\nThank you,\nViral Patel`
    );
    return `https://api.whatsapp.com/send?phone=91${cleanNumber}&text=${text}`;
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-outfit">
              Payroll Control Sheet
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-xs font-medium">
              Manage salary payouts, print receipts, and issue WhatsApp statements instantly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-2.5 shadow-xs">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-850">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="bg-transparent outline-none text-xs font-bold text-slate-700 dark:text-slate-350 cursor-pointer border-none"
              >
                <option value="">Month</option>
                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3.5 py-1.5 text-xs focus:outline-none text-slate-850 dark:text-slate-200 w-20 text-center font-black font-outfit"
            />

            <button
              onClick={generatePayroll}
              disabled={generating}
              className="btn-primary-premium flex items-center justify-center gap-1.5 text-xs py-2 px-4 rounded-xl"
            >
              <span>{generating ? "Generating..." : "Generate Payroll"}</span>
            </button>
          </div>
        </div>

        {/* PAYROLL SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SummaryCard
            title="Total Monthly Payroll"
            value={totalPayout}
            icon={<Coins className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
            color="border-l-4 border-indigo-600"
            subtext="All generated payouts"
          />
          <SummaryCard
            title="Settle Paid Payouts"
            value={paidPayout}
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
            color="border-l-4 border-emerald-500"
            subtext="Transferred payments"
          />
          <SummaryCard
            title="Outstanding Balance"
            value={pendingPayout}
            icon={<Clock className="w-5 h-5 text-amber-500" />}
            color="border-l-4 border-amber-500"
            subtext="Pending contractor payments"
          />
        </div>

        {/* SEARCH & EXPORT */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl shadow-xs p-3.5 flex items-center gap-4 transition-all duration-300 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 max-w-md">
            <Search className="text-slate-400 dark:text-slate-500 w-4 h-4 shrink-0" />
            <input
              type="text"
              placeholder="Search payroll by labour name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent outline-none text-xs font-semibold text-slate-850 dark:text-slate-100 placeholder-slate-455 dark:placeholder-slate-500"
            />
          </div>

          <button
            onClick={handleExportExcel}
            className="btn-secondary-premium flex items-center justify-center gap-2 text-xs"
            title="Export Excel"
          >
            <Download className="w-4 h-4" />
            <span>Export Payroll Sheet</span>
          </button>
        </div>

        {/* DATA TABLE */}
        {filteredPayrolls.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-[24px] shadow-sm p-16 text-center border border-slate-200/50 dark:border-slate-800/80">
            <FileSpreadsheet className="text-slate-350 dark:text-slate-650 w-16 h-16 mx-auto mb-4 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 font-outfit uppercase tracking-wider">No payroll sheets generated</h3>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1 font-medium">Select a month above and generate new payroll records.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-[24px] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200/60 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs tracking-wider uppercase font-semibold font-outfit">
                    <th className="px-6 py-4.5 text-left font-semibold">Labour Name</th>
                    <th className="px-6 py-4.5 text-left font-semibold">Period</th>
                    <th className="px-6 py-4.5 text-left font-semibold">Net Payout</th>
                    <th className="px-6 py-4.5 text-left font-semibold">Status</th>
                    <th className="px-6 py-4.5 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {filteredPayrolls.map((payroll, index) => (
                    <motion.tr
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15, delay: index * 0.02 }}
                      key={payroll._id}
                      className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white font-outfit text-xs">
                        {payroll.labour?.name || payroll.labourName || "Deleted Labour"}
                      </td>

                      <td className="px-6 py-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
                        {payroll.month} {payroll.year}
                      </td>

                      <td className="px-6 py-4 font-black text-slate-850 dark:text-white font-outfit text-xs">
                        {payroll.totalSalary.toLocaleString("en-IN")}
                      </td>

                      <td className="px-6 py-4">
                        {payroll.paymentStatus === "Paid" ? (
                          <span className="badge-present text-[10px]">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                            Paid
                          </span>
                        ) : (
                          <span className="badge-halfday text-[10px]">
                            <AlertCircle className="w-3.5 h-3.5 mr-1 text-amber-500" />
                            Pending
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2.5 justify-end items-center">
                          {/* Share on WhatsApp */}
                          <a
                            href={getWhatsAppLink(payroll)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-500 hover:text-white text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 p-2 rounded-xl transition-all"
                            title="WhatsApp Share"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </a>

                          {/* View Receipt */}
                          <Link
                            to={`/receipt/${payroll._id}`}
                            className="bg-indigo-50 dark:bg-indigo-950/20 hover:bg-indigo-650 hover:text-white text-indigo-650 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 p-2 rounded-xl transition-all"
                            title="View / Print Receipt"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </Link>

                          {/* Settle / Unsettle */}
                          {payroll.paymentStatus !== "Paid" ? (
                            <button
                              onClick={() => markAsPaid(payroll._id)}
                              className="bg-indigo-600 hover:bg-indigo-750 text-white font-bold px-3 py-2 rounded-xl text-[10px] uppercase tracking-wider transition-all active:scale-95 hover:scale-[1.02]"
                            >
                              Settle
                            </button>
                          ) : (
                            <button
                              onClick={() => markAsPending(payroll._id)}
                              className="bg-rose-600 hover:bg-rose-750 text-white font-bold px-3 py-2 rounded-xl text-[10px] uppercase tracking-wider transition-all active:scale-95 hover:scale-[1.02]"
                            >
                              Unsettle
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
};

const SummaryCard = ({ title, value, icon, color, subtext }) => {
  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-5 rounded-[20px] shadow-xs relative overflow-hidden transition-premium hover:-translate-y-0.5 ${color}`}>
      <div className="flex justify-between items-start">
        <div className="space-y-3">
          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest font-outfit">
              {title}
            </p>
            <h3 className="text-xl font-black text-slate-850 dark:text-white mt-1.5 font-outfit">
              <AnimatedCounter value={value} />
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

export default Payroll;
