import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import {
  Search,
  Download,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Building,
  DollarSign
} from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import API from "../services/api";
import AnimatedCounter from "../components/AnimatedCounter";

const PaymentReport = () => {
  const [reports, setReports] = useState([]);
  const [sites, setSites] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchReports();
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      const res = await API.get("/sites");
      setSites(res.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await API.get("/reports/payment");
      setReports(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getContractorNames = (siteNameStr) => {
    if (!siteNameStr || siteNameStr === "N/A") return "N/A";
    const names = siteNameStr.split(", ").map(name => name.trim());
    const contractors = names.map(name => {
      const siteObj = sites.find(s => s.name === name);
      return siteObj?.contractorName;
    }).filter(Boolean);
    const uniqueContractors = [...new Set(contractors)];
    return uniqueContractors.length > 0 ? uniqueContractors.join(", ") : "N/A";
  };

  const handleExport = () => {
    const dataToExport = filteredReports.map((r) => ({
      Labour: r.labour?.name || r.labourName || "Deleted Labour",
      Month: r.month,
      Year: r.year,
      Sites: r.siteName,
      Contractor: getContractorNames(r.siteName),
      Salary: r.totalSalary,
      Status: r.paymentStatus,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payment Report");
    XLSX.writeFile(wb, "Payment_Report.xlsx");
  };

  const filteredReports = reports.filter((report) => {
    const labourName = report.labour?.name || report.labourName || "Deleted Labour";
    const contractorName = getContractorNames(report.siteName);

    const matchesSearch =
      labourName.toLowerCase().includes(search.toLowerCase()) ||
      contractorName.toLowerCase().includes(search.toLowerCase()) ||
      (report.siteName && report.siteName.toLowerCase().includes(search.toLowerCase()));

    return matchesSearch;
  });

  const totalPayments = filteredReports.reduce((sum, r) => sum + r.totalSalary, 0);
  const paidCount = filteredReports.filter(r => r.paymentStatus === "Paid").length;
  const pendingCount = filteredReports.filter(r => r.paymentStatus !== "Paid").length;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-outfit">
              Payment Auditing Reports
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-xs font-medium">
              View processed payouts, outstanding labour balances, and site-wise payment summaries.
            </p>
          </div>

          <button
            onClick={handleExport}
            className="btn-primary-premium flex items-center justify-center gap-2 text-xs"
            title="Download Excel Report"
          >
            <Download className="w-4 h-4" />
            <span>Export Reports</span>
          </button>
        </div>

        {/* METRICS SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-5 rounded-[20px] shadow-xs relative overflow-hidden border-l-4 border-l-indigo-650">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest font-outfit">Total Disbursed Wages</p>
                <h3 className="text-xl font-black text-slate-850 dark:text-white mt-1.5 font-outfit">
                  <AnimatedCounter value={totalPayments} />
                </h3>
              </div>
              <div className="p-2.5 bg-slate-55 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                <DollarSign className="w-4 h-4 text-indigo-500" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-5 rounded-[20px] shadow-xs relative overflow-hidden border-l-4 border-l-emerald-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest font-outfit">Setted Receipts Count</p>
                <h3 className="text-xl font-black text-slate-855 dark:text-white mt-1.5 font-outfit">
                  <AnimatedCounter value={paidCount} formatter={(v) => v} />
                </h3>
              </div>
              <div className="p-2.5 bg-slate-55 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-5 rounded-[20px] shadow-xs relative overflow-hidden border-l-4 border-l-amber-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest font-outfit">Pending Payouts</p>
                <h3 className="text-xl font-black text-slate-850 dark:text-white mt-1.5 font-outfit">
                  <AnimatedCounter value={pendingCount} formatter={(v) => v} />
                </h3>
              </div>
              <div className="p-2.5 bg-slate-55 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                <AlertCircle className="w-4 h-4 text-amber-500" />
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl shadow-xs p-3.5 flex items-center gap-4 transition-all duration-300 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500">
          <Search className="text-slate-400 dark:text-slate-500 w-5 h-5 shrink-0" />
          <input
            type="text"
            placeholder="Search report by labour name, site, or contractor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-455"
          />
        </div>

        {/* DATA SHEET TABLE */}
        {filteredReports.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-[24px] shadow-sm p-16 text-center border border-slate-200/50 dark:border-slate-800/80">
            <FileSpreadsheet className="text-slate-350 dark:text-slate-650 w-16 h-16 mx-auto mb-4 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 font-outfit uppercase tracking-wider">No audited sheets matching search</h3>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1 font-medium">Verify spelling or try searching another contractor.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-[24px] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200/60 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs tracking-wider uppercase font-semibold font-outfit">
                    <th className="px-6 py-4.5 text-left font-semibold">Labour Worker</th>
                    <th className="px-6 py-4.5 text-left font-semibold">Project Sites</th>
                    <th className="px-6 py-4.5 text-left font-semibold">Contractor</th>
                    <th className="px-6 py-4.5 text-left font-semibold">Salary Amount</th>
                    <th className="px-6 py-4.5 text-left font-semibold">Audit status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {filteredReports.map((report, index) => (
                    <motion.tr
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15, delay: index * 0.02 }}
                      key={report._id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white font-outfit text-xs">
                        {report.labour?.name || report.labourName || "Deleted Labour"}
                      </td>

                      <td className="px-6 py-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
                        {report.siteName || "General"}
                      </td>

                      <td className="px-6 py-4 text-xs font-semibold text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        {getContractorNames(report.siteName)}
                      </td>

                      <td className="px-6 py-4 font-black text-slate-855 dark:text-white font-outfit text-xs">
                        {report.totalSalary.toLocaleString("en-IN")}
                      </td>

                      <td className="px-6 py-4">
                        {report.paymentStatus === "Paid" ? (
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

export default PaymentReport;